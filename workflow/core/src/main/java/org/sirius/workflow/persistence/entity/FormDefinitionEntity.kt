package org.sirius.workflow.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import javax.persistence.*
import java.io.Serializable
import javax.persistence.Embeddable

@Embeddable
data class FormId(val id: String = "", val deployment: Long = 0, val name: String = "",  val bpmn: String = "") : Serializable {
}

@Entity
@IdClass(FormId::class)
//@EntityListeners(value = [EntityStatusListener::class])
class FormDefinitionEntity(
    @Id @Column var id: String = "",

    @Id @Column var deployment: Long = 0,

    @Id @Column var name: String = "",

    @Column var bpmn: String = "",

    @Column(length=50000) var xml: String = ""
)