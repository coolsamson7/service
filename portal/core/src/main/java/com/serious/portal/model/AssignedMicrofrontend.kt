package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class AssignedMicrofrontend(
    var id: Long?,
    var microfrontend: String,
    var version: String,
    var type: String
)