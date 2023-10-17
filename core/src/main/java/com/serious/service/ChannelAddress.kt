package com.serious.service
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import java.net.URI

/**
 * Channel address
 *
 * @property channel the channel name
 * @property uri the [URI]
 */
data class ChannelAddress(val channel: String, val uri: URI)