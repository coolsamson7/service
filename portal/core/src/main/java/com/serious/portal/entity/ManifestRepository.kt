package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface ManifestRepository : CrudRepository<ManifestEntity, Long> {
    override fun findById(id: Long): Optional<ManifestEntity>
}
