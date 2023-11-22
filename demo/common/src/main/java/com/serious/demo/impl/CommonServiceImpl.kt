package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.CommonService
import com.serious.demo.Foo
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class CommonServiceImpl : CommonService {
    override fun hello(): String {
        return "hello"
    }

    override fun sayHello(world : String, times: Int) : String {
        return "hello" + world;
    }

    override fun post(foo : Foo, times: Int) : Foo {
        return foo
    }
}
