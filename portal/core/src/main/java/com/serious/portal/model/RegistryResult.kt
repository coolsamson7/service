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
