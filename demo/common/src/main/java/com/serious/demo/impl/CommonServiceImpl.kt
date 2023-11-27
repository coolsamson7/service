package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.CommonService
import com.serious.demo.Foo
import com.serious.demo.RGB
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class CommonServiceImpl : CommonService {
    override fun hello(color: RGB): String {
        return color.toString()
    }

    override fun sayHello(world : String, times: Int) : String {
        val builder = StringBuilder()

        for (i in 1..times)
            builder.append("hello" + world)

        return builder.toString();
    }

    override fun post(foo : Foo, times: Int) : Foo {
        return foo
    }

    override fun anotherPost(foo : Foo, times: Int, really: Boolean) : Foo {
        return foo
    }
}
