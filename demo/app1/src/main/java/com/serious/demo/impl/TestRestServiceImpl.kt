package com.serious.demo.impl

import com.serious.demo.TestRestService
import org.springframework.web.bind.annotation.RestController

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@RestController
internal class TestRestServiceImpl : TestRestService {
    override fun hello(): String {
        return "hello"
    }
}
