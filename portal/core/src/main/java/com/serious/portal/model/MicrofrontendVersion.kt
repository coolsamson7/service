package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class MicrofrontendVersion(
    var id: String, // combination of mfe:version
    var microfrontend: String,
    var version: String,
    var manifest : Manifest,
    var configuration : String,
    var enabled : Boolean,
    var instances : List<MicrofrontendInstance>
)