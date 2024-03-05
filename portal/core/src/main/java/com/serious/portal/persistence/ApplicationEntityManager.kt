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
class ApplicationEntityManager {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager
}
