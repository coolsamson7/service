package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.annotation.JsonInclude


@JsonInclude(JsonInclude.Include.NON_NULL)
data class Router(
    var lazyModule : String,
    var reuse : Boolean = false,
    var path : String? = null
)

@JsonInclude(JsonInclude.Include.NON_NULL)
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

    var module: String? = null
)
