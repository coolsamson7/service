package com.serious.demo.impl

import com.serious.demo.Foo
import com.serious.demo.TestRemoteRestService
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@RestController
internal class TestRemoteRestServiceImpl : TestRemoteRestService {
    override fun hello(): String {
        return "foo"
    }

    override fun passId(id: String): String {
        return id
    }

    override fun passIdReturnBody(id: String): Foo {
        return Foo()
    }

    override fun postBody(foo: Foo): Foo {
        return foo
    }

    override fun postBodyMono(foo: Foo): Mono<Foo> {
        return Mono.just(foo)
    }

    override fun passParam(id: String): String {
        return id
    }
}
