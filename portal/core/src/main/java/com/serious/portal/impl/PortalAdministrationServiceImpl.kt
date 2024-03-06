package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.ManifestLoader
import com.serious.portal.ManifestManager
import com.serious.portal.MicrofrontendInstanceEntity
import com.serious.portal.PortalAdministrationService
import com.serious.portal.model.*
import com.serious.portal.persistence.*
import com.serious.portal.persistence.entity.ApplicationEntity
import com.serious.portal.persistence.entity.ApplicationVersionEntity
import com.serious.portal.persistence.entity.StageEntity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.net.MalformedURLException
import java.net.URL
import java.util.*

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
    override fun createApplication(application: Application) {
       this.applicationRepository.save(ApplicationEntity(application.name, application.configuration, ArrayList()))
    }
    @Transactional
    override fun readApplication(application: String) : Optional<Application> {
        fun mapVersion(entity: ApplicationVersionEntity): ApplicationVersion {
            return ApplicationVersion(
                entity.id!!,
                entity.version,
                entity.configuration
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
    override fun updateApplication(application: Application) {
        var entity : ApplicationEntity = applicationRepository.findById(application.name).get()

        entity.configuration = application.configuration
        //this.applicationRepository.save(ApplicationEntity(application.name, application.configuration))
    }
    @Transactional
    override fun deleteApplication(application: String){
        this.applicationRepository.deleteById(application)
    }
    @Transactional
    override fun readApplications() : List<Application> {
        fun mapVersion(entity: ApplicationVersionEntity): ApplicationVersion {
            return ApplicationVersion(
                entity.id!!,
                entity.version,
                entity.configuration
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
           null,
            applicationEntity,
            applicationVersion. version,
            applicationVersion.configuration
        ))

        applicationVersion.id = entity.id!!

        return applicationVersion
    }
    @Transactional
    override fun updateApplicationVersion(application: ApplicationVersion) : ApplicationVersion {
        val entity = this.applicationVersionRepository.findById(application.id).get()

        entity.version = application.version
        entity.configuration = application.configuration

        return application
    }
    @Transactional
    override fun deleteApplicationVersion(application: String, version: Long) {
        val applicationEntity = this.applicationRepository.findById(application).get()

        val entity = applicationEntity.versions.find { entity -> entity.id == version }

        applicationEntity.versions.remove(entity)
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
                entity.manifest,
                entity.configuration,
                entity.enabled,
                entity.instances.map { instanceEntity -> mapInstance(instanceEntity) }
            )
        }
    }

    override fun updateMicrofrontendVersion(version: MicrofrontendVersion) : MicrofrontendVersion {
        val entity = this.microfrontendVersionRepository.findById(version.id).get()

        entity.configuration = version.configuration

        // TODO!!! hmmmm

        return version
    }

    // microfrontend instance

    override fun updateMicrofrontendInstance(instance: MicrofrontendInstance) : MicrofrontendInstance {
        val entity = this.microfrontendInstanceRepository.findById(instance.uri).get()

        entity.configuration = instance.configuration
        entity.stage = instance.stage

        // TODO!!! hmmmm

        return instance
    }

}
