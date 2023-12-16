package com.serious.portal.model

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

data class Router(
    var lazyModule : String,
    var reuse : Boolean = false,
    var path : String? = null
)

data class FeatureModule(
    var name : String
)
data class Feature(
    var id : String,
    var enabled: Boolean = true,
    var parent : String? = null,
    var description : String? = null,
    var label : String? = null,
    var component : String,
    var tags : Array<String>? = null,
    var categories : Array<String>? = null,
    var visibility: Array<String>? = null,
    var permissions: Array<String>? = null,
    var featureToggles: Array<String>? = null,
    var router: Router? = null,
    var children: Array<Feature>? = null,

    var module: FeatureModule? = null
)
