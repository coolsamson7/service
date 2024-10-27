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
class ApplicationVersionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    var id: Long = 0

    @ManyToOne
    @JoinColumn(name = "OR_APPLICATION")
    lateinit var application: ApplicationEntity

    @Column(name = "VERSION")
    lateinit var version: String

    @Column(name = "CONFIGURATION", length = 4000)
    lateinit var configuration: String

    @OneToMany(mappedBy = "applicationVersion", cascade = [CascadeType.ALL])
    lateinit var assignedMicrofrontends: MutableList<AssignedMicrofrontendEntity>
}
