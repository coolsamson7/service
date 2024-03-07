package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.AssignedMicrofrontendEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface AssignedMicrofrontedRepository : CrudRepository<AssignedMicrofrontendEntity, Long> {
    override fun findById(id: Long): Optional<AssignedMicrofrontendEntity>
}
