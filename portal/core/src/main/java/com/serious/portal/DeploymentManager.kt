package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.portal.configuration.ConfigurationMerger
import com.serious.portal.mapper.Mapper
import com.serious.portal.mapper.mapping
import com.serious.portal.model.*
import com.serious.portal.persistence.entity.ApplicationVersionEntity
import com.serious.portal.version.Version
import com.serious.portal.version.VersionRange
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.sirius.events.AbstractEventListener
import org.sirius.events.Event
import org.sirius.events.EventListener
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*
import kotlin.collections.HashMap

@Event(broadcast = true)
data class ClearCacheEvent(val name : String = "") // TODO: wohin


// types

data class FilterContext(
    val hasSession: Boolean
)

typealias ManifestFilter = (context: FilterContext, manifest: Manifest) -> Boolean

typealias FeatureFilter = (context: FilterContext, feature: Feature) -> Boolean

@EventListener(event = ClearCacheEvent::class)
@Component
class DeploymentManager() : AbstractEventListener<ClearCacheEvent> {
    // instance data

    private val manifestFilters = mutableListOf<ManifestFilter>()
    private val featureFilters = mutableListOf<FeatureFilter>()

    // constructor

    init {
        // manifest enabled

        filterManifest { context, manifest -> manifest.enabled }

        // health

        filterManifest { context, manifest -> manifest.health == "alive" }

        // feature enabled

        filterFeature { context, feature -> feature.enabled }

        // session

        fun specifiedVisibility(feature: Feature) :Boolean {
            return feature.visibility != null && feature.visibility!!.isNotEmpty()
        }

        filterFeature { context, feature ->
            if ( specifiedVisibility(feature))
                if (!context.hasSession)
                    // no session yet, allow public only
                    feature.visibility!!.contains("public")
                else
                    // a have a session, allow private only
                    feature.visibility!!.contains("private")
            else true
        }
    }

    // fluent

    fun filterManifest(filter: ManifestFilter): DeploymentManager {
        manifestFilters.add(filter)

        return this
    }

    fun filterFeature(filter: FeatureFilter): DeploymentManager {
        featureFilters.add(filter)

        return this
    }

    private fun accept(context: FilterContext, manifest: Manifest) : Boolean {
        for ( filter in manifestFilters)
            if ( !filter(context, manifest))
                return false

        return true
    }

    private fun accept(context: FilterContext, feature: Feature) : Boolean {
        for ( filter in featureFilters)
            if ( !filter(context, feature))
                return false

        return true
    }

    // public

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var merger : ConfigurationMerger

    @Autowired
    private lateinit var objectMapper : ObjectMapper

    fun findMicrofrontendVersion(application: String, version: String) : MicrofrontendVersionEntity? {
        val shellVersion =  this.entityManager.createQuery("select m from MicrofrontendVersionEntity m where m.microfrontend.name = :application and m.version =:version", MicrofrontendVersionEntity::class.java)
            .setParameter("version", version)
            .setParameter("application", application)
            .singleResult

        return shellVersion
    }

    fun findApplicationVersion(application: String, version: String) : ApplicationVersionEntity? {
        val shellVersion =  this.findMicrofrontendVersion(application, version)

        return if ( shellVersion !== null)
            shellVersion.applicationVersion
        else
            null
    }

    val instanceMapper = Mapper(
        mapping(MicrofrontendInstanceEntity::class, MicrofrontendInstance::class) {
            map { path("microfrontendVersion", "microfrontend", "name") to "microfrontend" }
            map { path("microfrontendVersion", "version") to "version" }
            map { matchingProperties("uri", "enabled", "health", "configuration", "stage") }
            map { "manifest" to "manifest" convert {manifest: String -> objectMapper.readValue(manifest, Manifest::class.java)}}
        })

    fun findShellInstances(application: Long) : List<MicrofrontendInstance> {
        // local function

        fun matchingVersion(microfrontend: MicrofrontendEntity, range: VersionRange) :MicrofrontendVersionEntity? {
            val versions = ArrayList(microfrontend.versions)
            versions.sortByDescending { version -> version.version }

            for ( version in versions)
                if ( range.matches(Version(version.version)))
                    return version

            return null
        }

        //

        val version = this.entityManager.find(ApplicationVersionEntity::class.java, application)

        var shellVersion : MicrofrontendVersionEntity? = null
        version.assignedMicrofrontends.first { assigned ->
            var version = matchingVersion(assigned.microfrontend, VersionRange(assigned.version))

            if ( version != null) {
                if ( version.type == "shell")
                    shellVersion = version
                else
                    version = null
            }

            version != null
        }

        return if (shellVersion != null)
            shellVersion!!.instances.map { entity -> instanceMapper.map<MicrofrontendInstance>(entity)!!}
        else
            listOf()
    }

    // TODO: cache
    fun create(request: DeploymentRequest) : Deployment {
        // local function

        fun matchingVersion(microfrontend: MicrofrontendEntity, range: VersionRange) :MicrofrontendVersionEntity? {
            val versions = ArrayList(microfrontend.versions)
            versions.sortByDescending { version -> version.version }

            for ( version in versions)
                if ( range.matches(Version(version.version)))
                    return version

            return null
        }

        // lets go

        val shell = request.application
        val session = request.session
        val uri = request.protocol + "//" + request.host + ":" + request.port

        // find instance

        val shellInstance = this.entityManager.createQuery("select m from MicrofrontendInstanceEntity m where m.uri = :uri", MicrofrontendInstanceEntity::class.java)
            .setParameter("uri", uri)
            .singleResult
        val shellVersion = shellInstance.microfrontendVersion
        val stage = shellInstance.stage

        // find possible application

        val assignedMFEs = this.entityManager.createQuery("select assigned from AssignedMicrofrontendEntity assigned where assigned.microfrontend.name = :name", AssignedMicrofrontendEntity::class.java)
            .setParameter("name", shell)
            .resultList

        // check match

        val match = assignedMFEs.first { assigned -> matchingVersion(assigned.microfrontend,  VersionRange(assigned.version)) === shellVersion }
        val applicationVersion = match.applicationVersion

        val configurations = ArrayList<String>()

        configurations.add(applicationVersion.application.configuration)
        configurations.add(applicationVersion.configuration)

        val versions = ArrayList<MicrofrontendVersionEntity>()

        for ( assigned in applicationVersion.assignedMicrofrontends) {
            val match = matchingVersion(assigned.microfrontend, VersionRange(assigned.version))
            if ( match != null && match.instances.find { instance -> instance.stage == stage } !== null) {
                versions.add(match)
                configurations.add(match.configuration)
            }
        }

        // manifests

        val manifests = versions.map { v ->
            val manifest = objectMapper.readValue(v.manifest, Manifest::class.java)

            val instance = v.instances.find { instance -> instance.stage == stage }!!

            manifest.enabled = instance.enabled && instance.microfrontendVersion.enabled && instance.microfrontendVersion.microfrontend.enabled
            manifest.remoteEntry = instance.uri
            manifest.healthCheck =  manifest.remoteEntry // TODO ???

            manifest
        }

        val configuration = merger.mergeConfigurationValues(configurations)

        return createDeployment(manifests, configuration, session)
    }

    fun createDeployment(manifests: List<Manifest>, configuration: String, session: Boolean) : Deployment {
        val context = FilterContext(session)

        // local function

        fun copyFeature(feature: Feature) : Feature {
            val result = feature.copy()

            val features = LinkedList<Feature>()
            if ( feature.children != null)
                for ( child in feature.children!!) {
                    val copy = copyFeature(child)

                    copy.enabled = accept(context, child)

                    features.add(copy)
                }

            result.children = features.toTypedArray()

            return result
        }

        val deployment = Deployment(configuration, HashMap())

        // add matching manifests

        for ( manifest in manifests)
            if (accept(context, manifest)) {
                val result = manifest.copy()

                // filter features

                var enabledFeatures = 0

                val features = LinkedList<Feature>()
                for (feature in manifest.features) {
                    // copy anyway

                    val copy = copyFeature(feature)
                    copy.enabled = accept(context, feature)
                    features.add(copy)

                    if (copy.enabled)
                        enabledFeatures++

                    result.features = features.toTypedArray()

                    // only add, if there is at least one enabled feature

                    if (enabledFeatures > 0)
                        deployment.modules.put(manifest.name, result)
                } // for
            }

        // done

        return deployment
    }

    // implement AbstractEventListener

    override fun on(event: ClearCacheEvent) {
        // TODO
    }
}
