package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.ManifestEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface ManifestRepository : CrudRepository<ManifestEntity, String> {
    override fun findById(id: String): Optional<ManifestEntity>
}
