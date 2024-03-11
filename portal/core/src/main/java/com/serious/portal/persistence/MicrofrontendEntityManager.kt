package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.portal.ManifestEntity
import com.serious.portal.MicrofrontendEntity
import com.serious.portal.MicrofrontendInstanceEntity
import com.serious.portal.MicrofrontendVersionEntity
import com.serious.portal.model.Manifest
import com.serious.portal.model.MicrofrontendInstance
import org.springframework.transaction.annotation.Transactional

import jakarta.persistence.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*
import kotlin.collections.ArrayList

@Component
class MicrofrontendEntityManager {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager
    @Autowired
    private lateinit var objectMapper : ObjectMapper
    @Autowired
    private lateinit var  microfrontendRepository: MicrofrontedRepository
    @Autowired
    private lateinit var  microfrontendVersionRepository: MicrofrontedVersionRepository
    @Autowired
    private lateinit var  microfrontendInstanceRepository: MicrofrontedInstanceRepository

    // private

    fun toTransportObject(entity: MicrofrontendInstanceEntity) : MicrofrontendInstance {
        val manifest = objectMapper.readValue(entity.manifest, Manifest::class.java)

        return MicrofrontendInstance(
            entity.microfrontendVersion.microfrontend.name,
            entity.microfrontendVersion.version,
            entity.uri,
            entity.enabled,
            entity.health,
            entity.configuration,
            manifest,
            entity.stage
        )
    }

    // public

    fun createMicrofrontendInstance(manifest: Manifest) : MicrofrontendInstance{
        val json = objectMapper.writeValueAsString(manifest)

        // microfrontend

        val versions :  MutableList<MicrofrontendVersionEntity> = ArrayList()
        val microfrontendEntity : MicrofrontendEntity = microfrontendRepository.findById(manifest.name).orElse(this.microfrontendRepository.save(MicrofrontendEntity(
            manifest.name,
            manifest.enabled,
            "{\"type\":\"object\",\"value\": []}",
            versions
        )))

        // version

        val id = manifest.name + ":" + manifest.version
        val instances :  MutableList<MicrofrontendInstanceEntity> = ArrayList()
        val versionEntity : MicrofrontendVersionEntity = microfrontendVersionRepository.findById(id).orElse(this.microfrontendVersionRepository.save(MicrofrontendVersionEntity(
            id,
            manifest.version,
            true,
            "{\"type\":\"object\",\"value\": []}",
            json,
            microfrontendEntity,
            instances,
            null
        )))

        microfrontendEntity.versions.add(versionEntity)

        this.microfrontendRepository.save(microfrontendEntity)

        // instance

        val instanceEntity = MicrofrontendInstanceEntity(
            manifest.remoteEntry!!,
            true,
            "alive",
            "PROD",
            "{\"type\":\"object\",\"value\": []}",
            json,
            versionEntity
        )

        versionEntity.instances.add(instanceEntity)

        this.microfrontendVersionRepository.save(versionEntity)

        microfrontendInstanceRepository.save(instanceEntity)

        return toTransportObject(instanceEntity)
    }

    @Transactional
    fun saveMicrofrontendInstance(microfrontendInstance: MicrofrontendInstance) {
        this.microfrontendInstanceRepository.findById(microfrontendInstance.uri).ifPresent { entity ->
            entity.manifest = objectMapper.writeValueAsString(microfrontendInstance.manifest)
            entity.health = microfrontendInstance.health
            entity.stage = microfrontendInstance.stage
            entity.configuration = microfrontendInstance.configuration
            entity.enabled = microfrontendInstance.enabled

            this.microfrontendInstanceRepository.save(entity)
        }
    }

    @Transactional
    fun updateEnabled(uri: String, enabled: Boolean) {
        this.entityManager.createQuery("update MicrofrontendInstanceEntity m set m.enabled = :enabled where m.uri=:id")
            .setParameter("enabled", enabled)
            .setParameter("id", uri)
            .executeUpdate()
    }

    @Transactional
    fun updateHealth(uri: String, health: String) {
        this.entityManager.createQuery("update MicrofrontendInstanceEntity m set m.health = :health where m.uri=:id")
            .setParameter("health", health)
            .setParameter("id", uri)
            .executeUpdate()
    }

    @Transactional
    fun readAll() : List<MicrofrontendInstance> {
        return this.microfrontendInstanceRepository.findAll().map { entity -> toTransportObject(entity) }
    }

    @Transactional
    fun deleteMicrofrontendInstanceById(uri: String) {
        this.microfrontendInstanceRepository.deleteById(uri)
    }

    @Transactional
    fun readMicrofrontendInstanceById(id: String) : MicrofrontendInstance {
        return this.toTransportObject(this.microfrontendInstanceRepository.findById(id).get())
    }
}
