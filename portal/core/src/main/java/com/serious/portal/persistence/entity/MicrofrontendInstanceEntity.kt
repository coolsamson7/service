package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*

@Entity
@Table(name="MICROFRONTEND_INSTANCE")
class MicrofrontendInstanceEntity(
    @Id
    @Column(name = "URI")
    var uri: String,
    @Column(name = "ENABLED")
    var enabled : Boolean,
    @Column(name = "STAGE", length = 255)
    var stage : String,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String,
    @ManyToOne
    @JoinColumn(name="OR_MICROFRONTEND_VERSION")
    var microfrontendVersion : MicrofrontendVersionEntity,
)
