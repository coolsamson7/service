package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

interface TopologyListener {
    fun update(update: ServiceInstanceRegistry.TopologyUpdate)
}
