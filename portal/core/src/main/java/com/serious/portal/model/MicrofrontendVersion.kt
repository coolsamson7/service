package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class MicrofrontendVersion(
    var id: String, // combination of mfe:version
    var version: String,
    var manifest : String,
    var configuration : String,
    var enabled : Boolean,
    var instances : List<MicrofrontendInstance>
)