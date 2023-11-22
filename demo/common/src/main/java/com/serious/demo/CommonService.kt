package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Service
import com.serious.service.ServiceInterface
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

    @GetMapping("hello/{world}")
    @ResponseBody
    fun sayHello(@PathVariable() world : String, @RequestParam() times: Int) : String

    @PostMapping("post")
    @ResponseBody
    fun post(@RequestBody() foo : Foo, @RequestParam() times: Int) : Foo

}
