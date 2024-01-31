package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.portal.ManifestEntity
import com.serious.portal.model.Manifest
import org.springframework.transaction.annotation.Transactional

import jakarta.persistence.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class ManifestEntityManager {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager
    @Autowired
    private lateinit var objectMapper : ObjectMapper
    @Autowired
    private lateinit var  repository : ManifestRepository

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
        this.entityManager.persist(toEntity(manifest))
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

        //this.entityManager.remove(toEntity(manifest))// TODO id?????

        /*val id = 1
        this.entityManager.createQuery("delete from ManifestEntity p where p.id=:id")
            .setParameter("id", id)
            .executeUpdate();*/
    }

    @Transactional
    fun readManifestById(id: String) : Manifest {
        return this.toManifest(this.repository.findById(id).get())
    }
}
