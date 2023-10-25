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
    /**
     * any startup code that will be executed on startup
     */
    fun startup()

    /**
     * any shutdown code executed while shutting down
     */
    fun shutdown()

    /**
     * the available addresses under which the component can be called remotely
     */
    val addresses: List<ChannelAddress>

    /**
     * the component status
     */
    val status: ComponentStatus

    /**
     * the component health
     */
    val health: ComponentHealth
}
