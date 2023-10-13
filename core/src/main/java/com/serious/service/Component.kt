package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * A <code>Component</code> is a container for [Service]s
 */
interface Component : Service {
    fun startup()
    fun shutdown()

    val addresses: List<ChannelAddress>

    val status: ComponentStatus

    val health: ComponentHealth
}
