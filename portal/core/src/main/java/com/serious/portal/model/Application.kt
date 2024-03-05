package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class Application(
    var name : String,
    var configuration : String,
    var versions: List<ApplicationVersion>
)

data class ApplicationVersion(
    var id : Long,
    //var application : Application,
    var version : String,
    var configuration : String
)