package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class MicrofrontendInstance(
    var uri: String,
    var enabled : Boolean,
    var configuration : String,
    var stage : String,
    //var microfrontendVersion : MicrofrontendVersion,
)