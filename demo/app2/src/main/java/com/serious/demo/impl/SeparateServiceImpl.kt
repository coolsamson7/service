package com.serious.demo.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.demo.SeparateService
import org.springframework.web.bind.annotation.RestController

@RestController
internal class SeparateServiceImpl : SeparateService {
    override fun hello(world: String): String {
        return "hello" + world
    }
}
