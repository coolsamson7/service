package org.sirius.workflow.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import javax.persistence.*
import java.io.Serializable

@Embeddable
class ProcessId(val id: String? = null, val deployment: Long = 0) : Serializable

// TODO: entityStatus  + versionCounter

@Entity
data class ProcessDefinitionEntity(
    @Id
    //@GeneratedValue(strategy = GenerationType.UUID)
    @Column var id: String? = null,

    @Id @Column var deployment: Long = 0,

    @Column var bpmn: String = "",

    @Column var name: String = "",

    @Column(length=50000) var xml: String = ""
) : Serializable