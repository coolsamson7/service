package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class Microfrontend(
    var name: String,
    var enabled: Boolean,
    var configuration: String,
    var versions : List<MicrofrontendVersion>
)