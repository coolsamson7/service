package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.Embeddable
import org.sirius.common.bean.Attribute
import java.io.Serializable
import java.time.LocalDateTime


@Embeddable
data class EntityStatus(@Attribute var creatingDate: LocalDateTime? = null,
                   @Attribute var creatingUser: String? = null,
                   @Attribute var updatingDate: LocalDateTime? = null,
                   @Attribute var updatingUser: String? = null) : Serializable {
}