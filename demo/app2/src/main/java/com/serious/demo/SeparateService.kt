package com.serious.demo

import com.serious.service.Service
import com.serious.service.ServiceInterface

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

@ServiceInterface()
interface SeparateService : Service {
    fun hello(world: String): String
}