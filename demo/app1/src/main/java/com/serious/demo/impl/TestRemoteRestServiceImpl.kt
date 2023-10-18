package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.fasterxml.jackson.annotation.*
import com.fasterxml.jackson.annotation.ObjectIdGenerators.IntSequenceGenerator
import com.fasterxml.jackson.databind.*
import com.fasterxml.jackson.databind.cfg.DeserializerFactoryConfig
import com.fasterxml.jackson.databind.deser.BeanDeserializerFactory
import com.fasterxml.jackson.databind.deser.DefaultDeserializationContext
import com.serious.demo.Foo
import com.serious.demo.TestRemoteRestService
import com.serious.exception.AllowedException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono


@RestController
internal class TestRemoteRestServiceImpl : TestRemoteRestService {
    override fun throwException(id: String): Void {
        throw RuntimeException(id)
    }

    override fun throwFatalException(id: String): Void {
        throw RuntimeException(id)
    }

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
