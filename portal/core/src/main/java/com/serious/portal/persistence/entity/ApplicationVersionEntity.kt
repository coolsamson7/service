package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*


@Entity
@Table(name="APPLICATION_VERSION")
class ApplicationVersionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID")
    var id : Long? = null,
    @ManyToOne
    @JoinColumn(name="OR_APPLICATION")//, referencedColumnName = "NAME", nullable=false)
    var application : ApplicationEntity,
    @Column(name = "VERSION")
    var version : String,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String
)
