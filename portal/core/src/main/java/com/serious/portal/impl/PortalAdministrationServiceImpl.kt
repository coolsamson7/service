package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.portal.*
import com.serious.portal.mapper.*
import com.serious.portal.mapper.Mapping
import com.serious.portal.model.*
import com.serious.portal.persistence.*
import com.serious.portal.persistence.entity.ApplicationEntity
import com.serious.portal.persistence.entity.ApplicationVersionEntity
import com.serious.portal.persistence.entity.StageEntity
import jakarta.persistence.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.net.MalformedURLException
import java.net.URL
import java.util.*
import kotlin.collections.ArrayList

@Component
@RestController
class PortalAdministrationServiceImpl : PortalAdministrationService {
    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Autowired
    lateinit var manifestManager: ManifestManager

    @Autowired
    lateinit var microfrontendManager: MicrofrontendManager

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

    val readApplicationMapper = Mapper(
        mapping(ApplicationEntity::class, Application::class) {
            map { matchingProperties("name", "configuration") }
            map { "versions" to "versions" deep true }
        },

        mapping(AssignedMicrofrontendEntity::class, AssignedMicrofrontend::class) {
            map { matchingProperties("id", "version") }
            map { path("microfrontend", "name") to "microfrontend" }
        },

        mapping(ApplicationVersionEntity::class, ApplicationVersion::class) {
            map { matchingProperties("id", "version", "configuration") }
            map { "assignedMicrofrontends" to "assignedMicrofrontends" deep true}
        })

    @Transactional
    override fun readApplication(application: String) : Optional<Application> {
        val application :  Optional<Application> = this.applicationRepository.findById(application).map { entity -> readApplicationMapper.map<Application>(entity) }

        println(readApplicationMapper.describe())
        return application
    }

    @Transactional
    override fun updateApplication(application: Application) :Application {
        val entity : ApplicationEntity = applicationRepository.findById(application.name).get()

        // local class

        val synch = object : RelationSynchronizer<ApplicationVersion, ApplicationVersionEntity, Long?>({ to: ApplicationVersion -> to.id }, { entity: ApplicationVersionEntity -> entity.id }) {
            // override

            override fun missingPK(pk: Long?) : Boolean {
                return pk == null || pk == 0L
            }

            override fun provide(referencedTransportObject: ApplicationVersion, context: Mapping.Context): ApplicationVersionEntity {
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

            override fun delete(entity: ApplicationVersionEntity) {
                applicationVersionRepository.deleteById(entity.id)
            }

            override fun update(entity: ApplicationVersionEntity, transportObject: ApplicationVersion, context: Mapping.Context) {
                entity.version = transportObject.version
                entity.configuration = transportObject.configuration
            }
        }

        val mapper = Mapper(
            mapping(Application::class, ApplicationEntity::class) {
                map { matchingProperties("name", "configuration") }
                map { "versions" to "versions" synchronize synch }
            })

        mapper.map(application, entity)

        // done

        return application
    }

    @Transactional
    override fun deleteApplication(application: String){
        this.applicationRepository.deleteById(application)
    }
    @Transactional
    override fun readApplications() : List<Application> {
        val applications =  this.applicationRepository.findAll().map { entity -> readApplicationMapper.map<Application>(entity)!! }

        return applications
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

            override fun provide(referencedTransportObject: AssignedMicrofrontend, context: Mapping.Context): AssignedMicrofrontendEntity {
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

            override fun delete(entity: AssignedMicrofrontendEntity) {
                assignedMicrofrontendRepository.deleteById(entity.id)
            }

            override fun update(entity: AssignedMicrofrontendEntity, transportObject: AssignedMicrofrontend, context: Mapping.Context) {
                entity.version = transportObject.version
                //entity.microfrontend = transportObject.microfrontend
            }
        }

        val mapper = Mapper(
            mapping(ApplicationVersion::class, ApplicationVersionEntity::class) {
                map { matchingProperties("version", "configuration") }
                map { "assignedMicrofrontends" to "assignedMicrofrontends" synchronize synchronizer }
            })

        mapper.map(application, entity)

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

    val readMicrofrontendMapper = Mapper(
        mapping(MicrofrontendEntity::class, Microfrontend::class) {
            map { matchingProperties("name", "enabled", "configuration") }
            map { "versions" to "versions" deep true }
        },

        mapping(MicrofrontendVersionEntity::class, MicrofrontendVersion::class) {
            map { matchingProperties("id", "version", "configuration", "enabled") }
            map { path("microfrontend", "name") to "microfrontend" }
            map { "manifest" to "manifest" convert {manifest: String -> objectMapper.readValue(manifest, Manifest::class.java)}}
            map { "instances" to "instances" deep true }
            map { path("applicationVersion", "id") to "applicationVersion" }
        },

        mapping(MicrofrontendInstanceEntity::class, MicrofrontendInstance::class) {
            map { path("microfrontendVersion", "microfrontend", "name") to "microfrontend" }
            map { path("microfrontendVersion", "version") to "version" }
            map { matchingProperties("uri", "enabled", "health", "configuration", "stage") }
            map { "manifest" to "manifest" convert {manifest: String -> objectMapper.readValue(manifest, Manifest::class.java)}}
        })

    @Transactional
    override fun readMicrofrontends() : List<Microfrontend> {
        return this.microfrontendRepository.findAll().map { entity -> readMicrofrontendMapper.map(entity)!! }
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
        return this.microfrontendVersionRepository.findAll().map { entity -> readMicrofrontendMapper.map(entity)!! }
    }

    @Transactional
    override fun updateMicrofrontendVersion(version: MicrofrontendVersion) : MicrofrontendVersion {
        val entity = this.microfrontendVersionRepository.findById(version.id).get()

        entity.configuration = version.configuration
        entity.manifest = objectMapper.writeValueAsString(version.manifest)
        if  ( version.applicationVersion != null)
            entity.applicationVersion = applicationVersionRepository.findById(version.applicationVersion!!).get()
        else
            entity.applicationVersion = null

        // TODO!!! hmmmm

        return version
    }

    // microfrontend instance

    @Transactional
    override fun updateMicrofrontendInstance(instance: MicrofrontendInstance) : MicrofrontendInstance {
        val entity = this.microfrontendInstanceRepository.findById(instance.uri).get()

        entity.configuration = instance.configuration
        entity.manifest = objectMapper.writeValueAsString(instance.manifest)
        entity.stage = instance.stage

        // TODO!!! hmmmm

        return instance
    }

    @Transactional
    override fun registerMicrofrontendInstance(manifest: Manifest) : MicrofrontendRegistryResult {
        // go

        val url = manifest.remoteEntry

        if ( manifest.healthCheck == null)
            manifest.healthCheck = manifest.remoteEntry

        // check for duplicates

        val result: MicrofrontendInstance? = microfrontendManager.instances.find { instance -> instance.uri == url }

        if (result != null)
            return MicrofrontendRegistryResult(RegistryError.duplicate, null, null, null, "microfrontend already registered")
        else {
            val instance = microfrontendManager.register(manifest)

            val microfrontendEntity = this.microfrontendRepository.findById(manifest.name).get()
            val microfrontendVersion = microfrontendEntity.versions.find { version -> version.version == manifest.version }

            println(readMicrofrontendMapper.describe())
            return MicrofrontendRegistryResult(
                null,
                readMicrofrontendMapper.map(microfrontendEntity),
                readMicrofrontendMapper.map(microfrontendVersion!!),
                instance,
                "registered"
            )
        }
    }
}
