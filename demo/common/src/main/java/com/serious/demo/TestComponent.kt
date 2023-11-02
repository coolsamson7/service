package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Component
import com.serious.service.ComponentInterface

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.NotNull

@ComponentInterface(
    name = "TestComponent",
    description = "do funny stuff",
    services = [TestService::class, TestRestService::class]
)
interface TestComponent : Component {
    @NotNull()
    fun hello(): String
}
