package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*

@Entity
@Table(name="MICROFRONTEND_VERSION")
class MicrofrontendVersionEntity(
    @Id
    @Column(name = "ID")
    var id: String,
    @Column(name = "MANIFEST", length = 5000)
    var manifest : String,
    @Column(name = "ENABLED")
    var enabled : Boolean,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String,
    @OneToMany(mappedBy="microfrontendVersion", cascade=[CascadeType.ALL])
    var instances : MutableList<MicrofrontendInstanceEntity>
)
