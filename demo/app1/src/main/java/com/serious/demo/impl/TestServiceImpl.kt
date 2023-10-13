package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.TestService
import org.springframework.stereotype.Component

@Component
class TestServiceImpl : TestService {
    override fun hello(): String {
        return "hello"
    }
}
