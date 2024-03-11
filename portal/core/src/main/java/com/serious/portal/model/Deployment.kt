package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */


data class Deployment(
    var configuration: String,
    var modules : HashMap<String, Manifest> = HashMap()
)
