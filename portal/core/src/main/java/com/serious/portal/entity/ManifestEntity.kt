package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*;

@Entity
class ManifestEntity(
    var json : String,
    var uri: String,
    @Id @GeneratedValue var id: Long? = null
)
