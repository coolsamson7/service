package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.persistence.entity.ApplicationVersionEntity
import jakarta.persistence.*

@Entity
@Table(name="MICROFRONTEND_VERSION")
class MicrofrontendVersionEntity(
    @Id
    @Column(name = "ID")
    var id: String,
    @Column(name = "VERSION")
    var version : String,
    @Column(name = "ENABLED")
    var enabled : Boolean,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String,
    @Column(name = "MANIFEST", length = 5000)
    var manifest : String,
    @ManyToOne
    @JoinColumn(name="OR_MICROFRONTEND")
    var microfrontend : MicrofrontendEntity,
    @OneToMany(mappedBy="microfrontendVersion", cascade=[CascadeType.ALL])
    var instances : MutableList<MicrofrontendInstanceEntity>,
    @OneToOne(optional = true, cascade=[])
    @JoinColumn(name = "OR_APPLICATION_VERSION")
    var applicationVersion : ApplicationVersionEntity?
)
