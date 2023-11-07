package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable
import java.net.URI

/**
 * Components expose [ChannelAddress] es under which they can be called by establishing a [Channel]
 *
 * @property channel the channel name
 * @property uri the [URI]
 */
data class ChannelAddress(val channel: String, val uri: URI) : Serializable