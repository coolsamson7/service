package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.AssignedMicrofrontendEntity
import jakarta.persistence.*


@Entity
@Table(name="APPLICATION_VERSION")
class ApplicationVersionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    var id : Long = 0,
    @ManyToOne
    @JoinColumn(name="OR_APPLICATION")
    var application : ApplicationEntity,
    @Column(name = "VERSION")
    var version : String,
    @Column(name = "CONFIGURATION", length = 4000)
    var configuration : String,
    @OneToMany(mappedBy="applicationVersion", cascade=[CascadeType.ALL])
    var assignedMicrofrontends : MutableList<AssignedMicrofrontendEntity>
)
