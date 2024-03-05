package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*


@Entity
@Table(name="APPLICATION")
class ApplicationEntity(
    @Id
    @Column(name = "NAME")
    var name : String,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String,
    @OneToMany(mappedBy="application" , cascade=[CascadeType.ALL])
    var versions : MutableList<ApplicationVersionEntity>
)
