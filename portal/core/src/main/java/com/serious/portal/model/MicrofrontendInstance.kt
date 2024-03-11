package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class MicrofrontendInstance(
    var microfrontend: String,
    var version: String,
    var uri: String,
    var enabled : Boolean,
    var health: String,
    var configuration : String,
    var manifest : Manifest,
    var stage : String,
    //var microfrontendVersion : MicrofrontendVersion,
)