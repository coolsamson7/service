package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.persistence.entity.ApplicationEntity

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface ApplicationRepository : CrudRepository<ApplicationEntity, String> {
    override fun findById(id: String): Optional<ApplicationEntity>
}
