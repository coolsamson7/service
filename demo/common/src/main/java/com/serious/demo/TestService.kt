package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Service
import com.serious.service.ServiceInterface

@ServiceInterface(name = "test service")
interface TestService : Service {
    fun hello(): String

    fun throwException() : Void
}
