package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Component
import com.serious.service.ComponentInterface
@ComponentInterface(
    name = "TestComponent",
    description = "du funny stuff",
    services = [TestService::class, TestRestService::class]
)
interface TestComponent : Component {
    fun hello(): String
}
