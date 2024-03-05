package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*


@Entity
@Table(name="STAGE")
class StageEntity(
    @Id
    @Column(name = "NAME")
    var name : String
)
