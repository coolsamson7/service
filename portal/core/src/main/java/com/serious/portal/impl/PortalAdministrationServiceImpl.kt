package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.*
import com.serious.portal.configuration.ConfigurationMerger
import com.serious.portal.model.*
import com.serious.portal.persistence.*
import com.serious.portal.persistence.entity.ApplicationEntity
import com.serious.portal.persistence.entity.ApplicationVersionEntity
import com.serious.portal.persistence.entity.StageEntity
import com.serious.portal.version.VersionRange
import jakarta.persistence.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.net.MalformedURLException
import java.net.URL
import java.util.*
import kotlin.collections.ArrayList

typealias PKGetter<T,PK> = (any: T) -> PK
abstract class RelationSynchronizer<TO, ENTITY, PK> protected constructor(private val toPK: PKGetter<TO,PK>, private val entityPK: PKGetter<ENTITY,PK>) {
    // protected

    protected open fun missingPK(pk: PK) : Boolean {
        return false
    }
    protected abstract fun provideEntity(referencedTransportObject: TO): ENTITY
    protected open fun deleteEntity(entity: ENTITY) {}
    protected open fun updateEntity(entity: ENTITY, transportObject: TO) {}

    protected fun addEntityToRelation(relation: MutableCollection<ENTITY>, referencedEntity: ENTITY) {
        relation.add(referencedEntity)
    }

    protected fun removeEntityFromRelation(relation: MutableCollection<ENTITY>, referencedEntity: ENTITY) {
        relation.remove(referencedEntity)
    }

    // main function
    fun synchronize(toRelation: Collection<TO>, entityRelation: MutableCollection<ENTITY>) {
        val entityMap: MutableMap<PK, ENTITY> = HashMap()

        // collect all entities in a map

        for (entity in entityRelation)
            entityMap[this.entityPK(entity)] = entity

        // iterate over transport objects

        for (to in toRelation) {
            val key = this.toPK(to)

            if (!missingPK(key)) {
                val entity = entityMap[key]

                if (entity == null)
                    addEntityToRelation(entityRelation, provideEntity(to))

                else {
                    // possibly update entity

                    updateEntity(entity, to)

                    entityMap.remove(key)
                } // else
            } // if
            else addEntityToRelation(entityRelation, provideEntity(to))
        } // for

        // deleted entities

        for (deletedPersistent in entityMap.values)
            if (isEntityToRemove(deletedPersistent)) {
                removeEntityFromRelation(entityRelation, deletedPersistent)

                deleteEntity(deletedPersistent)
            } // if
    }

    protected fun isEntityToRemove(entity: ENTITY): Boolean {
        return true
    }
}


@Component
@RestController
class PortalAdministrationServiceImpl : PortalAdministrationService {
    @Autowired
    lateinit var manifestManager: ManifestManager
    @Autowired
    lateinit var manifestLoader: ManifestLoader

    @Autowired
    lateinit var stageRepository: StageRepository

    @Autowired
    lateinit var applicationRepository: ApplicationRepository

    @Autowired
    lateinit var applicationVersionRepository: ApplicationVersionRepository

    @Autowired
    lateinit var microfrontendRepository: MicrofrontedRepository

    @Autowired
    lateinit var assignedMicrofrontendRepository: AssignedMicrofrontedRepository

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Autowired
    lateinit var microfrontendVersionRepository: MicrofrontedVersionRepository

    @Autowired
    lateinit var microfrontendInstanceRepository: MicrofrontedInstanceRepository

    // implement PortalAdministrationService

    override fun registerManifest(manifest: Manifest) : RegistryResult {
        var url = manifest.remoteEntry

        if ( manifest.healthCheck == null)
            manifest.healthCheck = manifest.remoteEntry

        // check for duplicates

        val result: Manifest? = manifestManager.manifests.find { manifest -> manifest.remoteEntry == url }

        if (result != null)
            return RegistryResult(RegistryError.duplicate, null, "microfrontend already registered")
        else {
            manifestManager.register(manifest)

            return RegistryResult(null, manifest, "registered")
        }
    }

    override fun registerMicrofrontend(address: Address): RegistryResult {
        var url : URL? = null

        try {
            url = URL(address.protocol + "//" + address.host + ":" + address.port)
        }
        catch(exception: MalformedURLException) {
            return RegistryResult(RegistryError.malformed_url, null, exception.message!!)
        }

        // check for duplicates

        val result: Manifest? = manifestManager.manifests.find { manifest -> manifest.remoteEntry == url.toString() }

        if (result != null)
            return RegistryResult(RegistryError.duplicate, null, "microfrontend already registered")
        else {
            var manifest : Manifest? = null
            try {
                manifest = manifestLoader.load(url)

                manifest.enabled = true
                manifest.health  = "alive"
                manifest.remoteEntry = url.toString()
            }
            catch (exception: Exception) {
                return RegistryResult(RegistryError.unreachable, null, exception.message!!)
            }

            manifestManager.register(manifest)

            return RegistryResult(null, manifest, "registered")
        }
    }

    override fun removeMicrofrontend(address: Address) {
        val url = URL(address.protocol + "//" + address.host + ":" + address.port).toString()

        manifestManager.remove(url)
    }

    override fun saveManifest(manifest: Manifest) {
        manifestManager.save(manifest)
    }

    override fun enableMicrofrontend(name : String, enabled: Boolean) {
        manifestManager.enableMicrofrontend(name, enabled)
    }

    override fun refresh() {
        manifestManager.refresh()
    }

    // TEST TODO
    override fun throwDeclaredException(): String {
        throw NullPointerException("ouch")
    }

    override fun throwException(): String {
        throw NullPointerException("ouch")
    }

    // NEW

    // stage

    @Transactional
    override fun createStage(stage: String) {
        this.stageRepository.save(StageEntity(stage))
    }
    @Transactional
    override fun deleteStage( stage: String) {
        this.stageRepository.deleteById(stage)
    }
    @Transactional
    override fun readStages() : List<String> {
        return this.stageRepository.findAll().map { stageEntity ->  stageEntity.name}
    }

    // application
    @Transactional
    override fun createApplication(application: Application) : Application {
       this.applicationRepository.save(ApplicationEntity(application.name, application.configuration, ArrayList()))

        return application
    }
    @Transactional
    override fun readApplication(application: String) : Optional<Application> {
        fun mapAssignedMicrofrontend(entity: AssignedMicrofrontendEntity): AssignedMicrofrontend {
            return AssignedMicrofrontend(
                entity.id,
                entity.microfrontend.name,
                entity.version
            )
        }

        fun mapVersion(entity: ApplicationVersionEntity): ApplicationVersion {
            return ApplicationVersion(
                entity.id,
                entity.version,
                entity.configuration,
                entity.assignedMicrofrontends.map { entity -> mapAssignedMicrofrontend(entity)}
            )
        }

        return this.applicationRepository.findById(application).map { entity ->
            Application(
                entity.name,
                entity.configuration,
                entity.versions.map { versionEntity -> mapVersion(versionEntity) }
            )
        }
    }
    @Transactional
    override fun updateApplication(application: Application) :Application {
        var entity : ApplicationEntity = applicationRepository.findById(application.name).get()

        entity.configuration = application.configuration

        // local class

        val synchronizer = object : RelationSynchronizer<ApplicationVersion, ApplicationVersionEntity, Long?>(
            fun (to: ApplicationVersion) : Long? { return to.id },
            fun (entity: ApplicationVersionEntity) : Long { return entity.id }) {

            override fun missingPK(pk: Long?) : Boolean {
                return pk == null || pk == 0L
            }

            override fun provideEntity(referencedTransportObject: ApplicationVersion): ApplicationVersionEntity {
                val entity = ApplicationVersionEntity(
                    0, // pk
                    entity, // applicationVersion
                    referencedTransportObject.version,
                    referencedTransportObject.configuration,
                    ArrayList(),
                )

                entityManager.persist(entity)

                referencedTransportObject.id = entity.id

                return entity
            }

            override fun deleteEntity(entity: ApplicationVersionEntity) {
                applicationVersionRepository.deleteById(entity.id)
            }

            override fun updateEntity(entity: ApplicationVersionEntity, transportObject: ApplicationVersion) {
                entity.version = transportObject.version
                entity.configuration = transportObject.configuration
                //entity.microfrontend = transportObject.microfrontend
            }
        }

        // synchronize

        synchronizer.synchronize(application.versions, entity.versions)

        // done

        return application
    }

    @Transactional
    override fun deleteApplication(application: String){
        this.applicationRepository.deleteById(application)
    }
    @Transactional
    override fun readApplications() : List<Application> {
        fun mapAssignedMicrofrontend(entity: AssignedMicrofrontendEntity): AssignedMicrofrontend {
            return AssignedMicrofrontend(
                entity.id,
                entity.microfrontend.name,
                entity.version
            )
        }

        fun mapVersion(entity: ApplicationVersionEntity): ApplicationVersion {
            return ApplicationVersion(
                entity.id,
                entity.version,
                entity.configuration,
                entity.assignedMicrofrontends.map { entity -> mapAssignedMicrofrontend(entity)}
            )
        }

        return this.applicationRepository.findAll().map { entity ->
            Application(
                entity.name,
                entity.configuration,
                entity.versions.map { versionEntity -> mapVersion(versionEntity) }
            )
        }
    }

    // application version

    @Transactional
    override fun createApplicationVersion(application: String, applicationVersion: ApplicationVersion) : ApplicationVersion {
        val applicationEntity = this.applicationRepository.findById(application).get()
        val entity = this.applicationVersionRepository.save(ApplicationVersionEntity(
           0,
            applicationEntity,
            applicationVersion. version,
            applicationVersion.configuration,
            ArrayList()
        ))

        applicationVersion.id = entity.id

        return applicationVersion
    }
    @Transactional
    override fun updateApplicationVersion(application: ApplicationVersion) : ApplicationVersion {
        val entity = this.applicationVersionRepository.findById(application.id!!).get()

        entity.version = application.version
        entity.configuration = application.configuration

        // local class

        val synchronizer = object : RelationSynchronizer<AssignedMicrofrontend, AssignedMicrofrontendEntity, Long?>(
            fun (to: AssignedMicrofrontend) : Long? { return to.id },
            fun (entity: AssignedMicrofrontendEntity) : Long { return entity.id }) {

             override fun missingPK(pk: Long?) : Boolean {
                return pk == null || pk == 0L
            }

            override fun provideEntity(referencedTransportObject: AssignedMicrofrontend): AssignedMicrofrontendEntity {
                val entity = AssignedMicrofrontendEntity(
                        0, // pk
                        entity, // applicationVersion
                        microfrontendRepository.findById(referencedTransportObject.microfrontend).get(), // microfrontend
                        referencedTransportObject.version,
                    )

                entityManager.persist(entity)

                referencedTransportObject.id = entity.id

                return entity
            }

            override fun deleteEntity(entity: AssignedMicrofrontendEntity) {
                assignedMicrofrontendRepository.deleteById(entity.id)
            }

            override fun updateEntity(entity: AssignedMicrofrontendEntity, transportObject: AssignedMicrofrontend) {
                entity.version = transportObject.version
                //entity.microfrontend = transportObject.microfrontend
            }
        }

        // synchronize

        synchronizer.synchronize(application.assignedMicrofrontends, entity.assignedMicrofrontends)

        // done

        return application
    }
    @Transactional
    override fun deleteApplicationVersion(application: String, version: String) {
        val applicationEntity = this.applicationRepository.findById(application).get()

        val versionEntity = applicationEntity.versions.find { entity -> entity.version == version }

        applicationEntity.versions.remove(versionEntity)

        this.applicationVersionRepository.delete(versionEntity!!)
    }

    // microfrontend

    @Transactional
    override fun readMicrofrontends() : List<Microfrontend> {
        fun mapInstance(entity: MicrofrontendInstanceEntity): MicrofrontendInstance {
            return MicrofrontendInstance(
                entity.uri,
                entity.enabled,
                entity.configuration,
                entity.stage,
            )
        }

        fun mapVersion(entity: MicrofrontendVersionEntity): MicrofrontendVersion {
            return MicrofrontendVersion(
                entity.id,
                entity.version,
                entity.manifest,
                entity.configuration,
                entity.enabled,
                entity.instances.map { entity -> mapInstance(entity) }
            )
        }

        return this.microfrontendRepository.findAll().map { entity ->
            Microfrontend(
                entity.name,
                entity.enabled,
                entity.configuration,
                entity.versions.map { entity -> mapVersion(entity) }
            )
        }
    }

    @Transactional
    override fun updateMicrofrontend(@RequestBody microfrontend: Microfrontend) : Microfrontend {
        val entity = this.microfrontendRepository.findById(microfrontend.name).get()

        entity.configuration = microfrontend.configuration

        // TODO!!! hmmmm whats up with versions?

        return microfrontend
    }

    // microfrontend versions

    @Transactional
    override fun readMicrofrontendVersions() : List<MicrofrontendVersion> {
        fun mapInstance(entity: MicrofrontendInstanceEntity): MicrofrontendInstance {
            return MicrofrontendInstance(
                entity.uri,
                entity.enabled,
                entity.configuration,
                entity.stage,
            )
        }

        return this.microfrontendVersionRepository.findAll().map { entity ->
            MicrofrontendVersion(
                entity.id,
                entity.version,
                entity.manifest,
                entity.configuration,
                entity.enabled,
                entity.instances.map { instanceEntity -> mapInstance(instanceEntity) }
            )
        }
    }

    @Transactional
    override fun updateMicrofrontendVersion(version: MicrofrontendVersion) : MicrofrontendVersion {
        val entity = this.microfrontendVersionRepository.findById(version.id).get()

        entity.configuration = version.configuration

        // TODO!!! hmmmm

        return version
    }

    // microfrontend instance

    @Transactional
    override fun updateMicrofrontendInstance(instance: MicrofrontendInstance) : MicrofrontendInstance {
        val entity = this.microfrontendInstanceRepository.findById(instance.uri).get()

        entity.configuration = instance.configuration
        entity.stage = instance.stage

        // TODO!!! hmmmm

        return instance
    }

    // TEST

    @Autowired
    lateinit var merger : ConfigurationMerger

    @Transactional
    override fun computeApplicationVersionConfiguration(application: Long) {
        // TODO: cache Long -> ... ( Deployment )
        // read version

        val applicationVersion : ApplicationVersionEntity = this.applicationVersionRepository.findById(application).get()

        val configurations = ArrayList<String>()

        configurations.add(applicationVersion.application.configuration)
        configurations.add(applicationVersion.configuration)

        // local function

        fun matchingVersion(microfrontend: MicrofrontendEntity, range: VersionRange) :MicrofrontendVersionEntity? {
            val versions = ArrayList(microfrontend.versions)
            versions.sortByDescending { version -> version.version }

            for ( version in versions)
                if ( range.matches(com.serious.portal.version.Version(version.version)))
                    return version

            return null
        }

        val versions = ArrayList<MicrofrontendVersionEntity>()

        for ( assigned in applicationVersion.assignedMicrofrontends) {
            assigned.microfrontend.configuration

            val match = matchingVersion(assigned.microfrontend, VersionRange(assigned.version))
            if ( match != null) {
                versions.add(match)
                configurations.add(match.configuration)

                println(match.microfrontend.name + "." + match.version)
            }
            else {
                println("no match for " + assigned.version)
            }
        }

        val configuration = merger.mergeConfigurationValues(configurations)

        println("configuration: " + configuration)
    }
}
