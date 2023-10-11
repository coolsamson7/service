package com.serious.service

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */ /**
 * @author Andreas Ernst
 */
interface Component : Service {
    fun startup()
    fun shutdown()
    val addresses: List<ServiceAddress>?
    val status: ComponentStatus?
    val health: ComponentHealth?
}
