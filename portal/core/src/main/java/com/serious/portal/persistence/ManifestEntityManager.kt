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
import org.springframework.transaction.annotation.Transactional

import jakarta.persistence.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*
import kotlin.collections.ArrayList

@Component
class ManifestEntityManager {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager
    @Autowired
    private lateinit var objectMapper : ObjectMapper
    @Autowired
    private lateinit var  repository : ManifestRepository
    // NEW
    @Autowired
    private lateinit var  microfrontendRepository: MicrofrontedRepository
    @Autowired
    private lateinit var  microfrontendVersionRepository: MicrofrontedVersionRepository
    @Autowired
    private lateinit var  microfrontendInstanceRepository: MicrofrontedInstanceRepository

    // private

    private fun toEntity(manifest: Manifest) : ManifestEntity {
        return ManifestEntity(
            manifest.remoteEntry!!,
            objectMapper.writeValueAsString(manifest),
            manifest.enabled,
            manifest.health!!
        )
    }

    fun toManifest(entity: ManifestEntity) : Manifest {
        val manifest = objectMapper.readValue(entity.json, Manifest::class.java)

        manifest.enabled = entity.enabled
        manifest.health = entity.health

        return manifest
    }

    // public

    @Transactional
    fun createManifest(manifest: Manifest) {
        val manifestEntity = toEntity(manifest)

        this.entityManager.persist(manifestEntity)

        // check instance, microfrontend-version and microfrontend and create on the fly...

        // NEW TODO

        // microfrontend

        val versions :  MutableList<MicrofrontendVersionEntity> = ArrayList()
        val microfrontendEntity : MicrofrontendEntity = microfrontendRepository.findById(manifest.name).orElse(this.microfrontendRepository.save(MicrofrontendEntity(
            manifest.name,
            manifest.enabled,
            "{}",
            versions
        )))

        // version

        val id = manifest.name + ":" + manifest.version
        val instances :  MutableList<MicrofrontendInstanceEntity> = ArrayList()
        val versionEntity : MicrofrontendVersionEntity = microfrontendVersionRepository.findById(id).orElse(this.microfrontendVersionRepository.save(MicrofrontendVersionEntity(
            id,
            manifest.version,
            manifestEntity.json,
            true,
            "{}",
            microfrontendEntity,
            instances
        )))

        // instance

        val instanceEntity = MicrofrontendInstanceEntity(
            manifestEntity.uri,
            true,
            "PROD",
            "{}",
            versionEntity
        )

        microfrontendInstanceRepository.save(instanceEntity)
    }

    @Transactional
    fun saveManifest(manifest: Manifest) {
        this.repository.findById(manifest.remoteEntry!!).ifPresent { entity ->
            entity.json = objectMapper.writeValueAsString(manifest)
            entity.health = manifest.health!!
            entity.enabled = manifest.enabled

            this.repository.save(entity)
        }
    }

    @Transactional
    fun updateEnabled(uri: String, enabled: Boolean) {
        this.entityManager.createQuery("update ManifestEntity m set m.enabled = :enabled where m.uri=:id")
            .setParameter("enabled", enabled)
            .setParameter("id", uri)
            .executeUpdate()
    }

    @Transactional
    fun updateHealth(uri: String, health: String) {
        this.entityManager.createQuery("update ManifestEntity m set m.health = :health where m.uri=:id")
            .setParameter("health", health)
            .setParameter("id", uri)
            .executeUpdate()
    }

    @Transactional
    fun readAll() : List<Manifest> {
        return this.repository.findAll().map { entity -> toManifest(entity) }
    }

    @Transactional
    fun deleteManifestById(uri: String) {
        this.repository.deleteById(uri)
    }

    @Transactional
    fun deleteManifest(manifest: Manifest) {
        this.repository.deleteById(manifest.remoteEntry!!)
    }

    @Transactional
    fun readManifestById(id: String) : Manifest {
        return this.toManifest(this.repository.findById(id).get())
    }
}
