package com.serious.service.administration.model

import java.io.Serializable
import java.net.URI
//import kotlinx.serialization.Serializable

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */
//@Serializable
data class ChannelDTO(
    val name: String,
    val uri: URI
) : Serializable