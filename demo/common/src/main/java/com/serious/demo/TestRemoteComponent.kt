package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Component
import com.serious.service.ComponentInterface
import org.springframework.web.bind.annotation.RestController

@ComponentInterface(name = "TestRemoteComponent", services = [TestRemoteRestService::class])
@RestController
interface TestRemoteComponent : Component
