package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


data class Deployment(
    var modules : HashMap<String, Manifest> = HashMap()
)
