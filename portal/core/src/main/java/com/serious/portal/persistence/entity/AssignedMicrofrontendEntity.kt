package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.persistence.entity.ApplicationVersionEntity
import jakarta.persistence.*

@Entity
@Table(name="ASSIGNED_MICROFRONTEND")
class AssignedMicrofrontendEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    var id : Long = 0,
    @ManyToOne
    @JoinColumn(name="OR_APPLICATION_VERSION")
    var applicationVersion : ApplicationVersionEntity,
    @OneToOne()
    @JoinColumn(name = "OR_MICROFRONTEND", referencedColumnName = "NAME")
    var microfrontend : MicrofrontendEntity,
    @Column(name = "VERSION")
    var version : String,
    @Column(name = "TYPE")
    var type : String,
)
