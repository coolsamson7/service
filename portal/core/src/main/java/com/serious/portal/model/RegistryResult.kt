package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

enum class RegistryError {
    duplicate,
    malformed_url,
    unreachable
}

data class RegistryResult(
    val error: RegistryError?,
    val manifest: Manifest?,
    val message: String
)

data class MicrofrontendRegistryResult(
    val error: RegistryError?,
    val microfrontend: Microfrontend?,
    val version: MicrofrontendVersion?,
    val instance: MicrofrontendInstance?,
    val message: String
)
