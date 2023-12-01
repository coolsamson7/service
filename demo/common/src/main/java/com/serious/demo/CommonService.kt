package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.annotations.Description
import com.serious.annotations.Parameter
import com.serious.service.Service
import com.serious.service.ServiceInterface
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import org.springframework.web.bind.annotation.*
import java.util.*

/**
 * @author Andreas Ernst
 */
@Description(
    "a very common service"
)
@ServiceInterface(name = "CommonService")
@RequestMapping("common/")
interface CommonService : Service {
    @Description(
        "say hello"
    )
    @GetMapping("hello")
    @ResponseBody
    fun hello(@RequestParam color: RGB, @RequestParam date: Date): String

    @Description(
        "say hello n times"
    )
    @GetMapping("hello/{world}")
    @ResponseBody
    fun sayHello(@PathVariable @Size(min = 1, max = 10) world : String, @RequestParam times: Int) : String

    @Description(
        value = "post is a super spooky method that\nposts a foo n times",
        parameters = [
            Parameter(name = "foo", description = "a foo"),
            Parameter(name = "times", description = "number of times")
        ]
    )
    @PostMapping("post")
    @ResponseBody
    fun post(@RequestBody foo : Foo, @RequestParam @Min(1) @Max(10) times: Int) : Foo

    @Description(
        value = "post is a super spooky method that\nposts a foo n times",
        parameters = [
            Parameter(name = "foo", description = "a foo"),
            Parameter(name = "times", description = "number of times"),
            Parameter(name = "really", description = "really")
        ]
    )
    @PostMapping("another-post")
    @ResponseBody
    fun anotherPost(@RequestBody foo : Foo, @RequestParam @Min(1) @Max(10) times: Int, @RequestParam really: Boolean) : Foo
}
