package com.serious.service.administration.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentModel
import com.serious.service.InterfaceDescriptor
import java.io.Serializable

data class ComponentDTO (
    val name: String,
    val label: String,
    val description: String,
    val model: ComponentModel,
    val channels: List<ChannelDTO>
): Serializable