package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*;

@Entity
@Table(name="MANIFEST")
class ManifestEntity(
    @Id
    @Column(name = "URI")
    var uri: String,
    @Column(name = "JSON", length = 5000)
    var json : String,
    @Column(name = "ENABLED")
    var enabled : Boolean,
    @Column(name = "HEALTH")
    var health : String
)
