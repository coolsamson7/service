package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.Manifest
import org.springframework.transaction.annotation.Transactional

import jakarta.persistence.*;
import org.springframework.stereotype.Component

@Component
class ManifestEntityManager() {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    // public

    @Transactional
    fun createManifest(manifest: Manifest) {
        val entity = ManifestEntity("json", manifest.remoteEntry!!)
        this.entityManager.persist(entity)
        println("A")
    }
}
