package com.serious.service.administration.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable
import java.net.URI

data class ChannelDTO(
    var name: String,
    var uri: List<URI>
) : Serializable