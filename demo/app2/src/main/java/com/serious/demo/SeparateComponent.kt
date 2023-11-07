package com.serious.demo
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.annotations.Description
import com.serious.service.Component
import com.serious.service.ComponentInterface

@ComponentInterface(services = [TestService::class])
@Description("only in app 2")
interface SeparateComponent : Component {
}
