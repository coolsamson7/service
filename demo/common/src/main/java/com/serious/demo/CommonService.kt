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

/**
 * @author Andreas Ernst
 */
@ServiceInterface(name = "CommonService")
@RequestMapping("common/")
interface CommonService : Service {
    @GetMapping("hello")
    @ResponseBody
    fun hello(): String

    @Description(
        "super"
    )
    @GetMapping("hello/{world}")
    @ResponseBody
    fun sayHello(@PathVariable @Size(min = 1, max = 10) world : String, @RequestParam times: Int) : String

    @Description(
        value = "super",
        parameters = [
            Parameter(name = "foo", description = "a foo"),
            Parameter(name = "times", description = "a times")
        ]
    )
    @PostMapping("post")
    @ResponseBody
    fun post(@RequestBody foo : Foo, @RequestParam @Min(1) @Max(10) times: Int) : Foo

    @PostMapping("another-post")
    @ResponseBody
    fun anotherPost(@RequestBody foo : Foo, @RequestParam @Min(1) @Max(10) times: Int, @RequestParam really: Boolean) : Foo
}
