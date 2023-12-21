package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*;

@Entity
class ManifestStatus(
    @Id @GeneratedValue var id: Long? = null,
    var status : String
)
