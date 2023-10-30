package com.serious.service.administration.model

import java.io.Serializable

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


//import kotlinx.serialization.Serializable

//@Serializable
data class ComponentDTO (
    val name: String,
    val description: String,
    val services: List<ServiceDTO>,
    val channels: List<ChannelDTO>
): Serializable