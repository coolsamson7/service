package com.serious.demo

import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@ServiceInterface
@RestController
interface TestRemoteRestService : Service {
    @PostMapping("/throw")
    @ResponseBody
    @Throws(RuntimeException::class)
    fun throwException(@RequestBody id: String): Void

    @PostMapping("/throwFatal")
    @ResponseBody
    fun throwFatalException(@RequestBody id: String): Void

    @GetMapping("/hello")
    fun hello(): String

    @GetMapping("/passId/{id}")
    fun passId(@PathVariable("id") id: String): String

    @GetMapping("/passIdReturnBody/{id}")
    @ResponseBody
    fun passIdReturnBody(@PathVariable("id") id: String): Foo

    @PostMapping("/postBody")
    @ResponseBody
    fun postBody(@RequestBody foo: Foo): Foo

    @GetMapping("/passParam")
    fun passParam(@RequestParam("id") id: String): String

    @PostMapping("/postBodyMono")
    @ResponseBody
    fun postBodyMono(@RequestBody foo: Foo): Mono<Foo>
}
