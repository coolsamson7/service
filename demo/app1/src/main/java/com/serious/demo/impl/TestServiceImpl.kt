package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.TestService
import com.serious.service.AbstractService
import org.springframework.stereotype.Component

@Component
class TestServiceImpl : AbstractService(), TestService {
    override fun hello(): String {
        return "hello"
    }
}
