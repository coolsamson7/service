package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*

@Entity
@Table(name="MICROFRONTEND")
class MicrofrontendEntity(
    @Id
    @Column(name = "NAME")
    var name: String,
    @Column(name = "ENABLED")
    var enabled : Boolean,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String,
    @OneToMany(mappedBy="microfrontend", cascade=[CascadeType.ALL])
    var versions : MutableList<MicrofrontendVersionEntity>
)
