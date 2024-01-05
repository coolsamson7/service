package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.persistence.entity.UserProfileEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface UserProfileRepository : CrudRepository<UserProfileEntity, String> {
    override fun findById(id: String): Optional<UserProfileEntity>
}
