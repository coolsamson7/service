package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.persistence.entity.ApplicationVersionEntity

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface ApplicationVersionRepository : CrudRepository<ApplicationVersionEntity, Long> {
    override fun findById(id: Long): Optional<ApplicationVersionEntity>
}
