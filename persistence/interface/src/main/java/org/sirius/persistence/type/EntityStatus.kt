package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.Embeddable
import jakarta.persistence.Temporal
import jakarta.persistence.TemporalType
import org.sirius.common.bean.Attribute
import java.io.Serializable
import java.time.LocalDateTime


@Embeddable
data class EntityStatus(@Temporal(TemporalType.TIMESTAMP) @Attribute var creatingDate: LocalDateTime? = null,
                        @Attribute var creatingUser: String? = null,
                        @Temporal(TemporalType.TIMESTAMP) @Attribute var updatingDate: LocalDateTime? = null,
                        @Attribute var updatingUser: String? = null) : Serializable {
}