package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.MicrofrontendVersionEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface MicrofrontedVersionRepository : CrudRepository<MicrofrontendVersionEntity, String> {
    override fun findById(id: String): Optional<MicrofrontendVersionEntity>
}
