package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*


@Entity
@Table(name="HELP")
class HelpEntity(
    @Id
    @Column(name = "FEATURE")
    var feature : String,

    @Column(name = "HELP", length = 4000)
    var help : String
)
