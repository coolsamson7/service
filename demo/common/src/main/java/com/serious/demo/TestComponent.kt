package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.annotations.Description
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
@Description("my first component")
interface TestComponent : Component {
    @Description("say hello")
    @NotNull()
    fun hello(@Description("world") world: String): String
}
