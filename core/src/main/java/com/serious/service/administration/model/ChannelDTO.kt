package com.serious.service.administration.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable
import java.net.URI

data class ChannelDTO(
    val name: String,
    val uri: URI
) : Serializable