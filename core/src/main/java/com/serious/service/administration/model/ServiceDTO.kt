package com.serious.service.administration.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable

data class ServiceDTO(
    val name: String,
    val description: String
): Serializable