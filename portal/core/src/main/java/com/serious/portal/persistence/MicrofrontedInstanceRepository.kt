package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.MicrofrontendInstanceEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface MicrofrontedInstanceRepository : CrudRepository<MicrofrontendInstanceEntity, String> {
    override fun findById(id: String): Optional<MicrofrontendInstanceEntity>
}
