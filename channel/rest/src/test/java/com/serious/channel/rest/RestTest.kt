package com.serious.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.FatalException
import com.serious.service.*
import com.serious.service.registry.LocalComponentRegistry
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.io.Serializable
import java.lang.NullPointerException
import java.net.URI

internal data class Foo(var id: String? = null): Serializable

@Component
internal class TestComponentComponentRegistry : LocalComponentRegistry()

@ServiceInterface
@RequestMapping("exception/")
internal interface ExceptionMethods : Service {
    @RequestMapping(path = ["throwDeclared"], method = [RequestMethod.GET])
    @ResponseBody
    @Throws(NullPointerException::class)
    fun throwDeclaredException(): String

    @RequestMapping(path = ["throw"], method = [RequestMethod.GET])
    @ResponseBody
    fun throwException(): String
}

@ServiceInterface
@RequestMapping("flux/")
internal interface FluxMethods : Service {
    @RequestMapping(path = ["get/{world}"], method = [RequestMethod.GET])
    @ResponseBody
    operator fun get(@PathVariable("world") world: String): Mono<String>

    @RequestMapping(path = ["get-list/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getList(@PathVariable count: Int): Flux<Int>
}

@ServiceInterface
@RequestMapping("request/")
internal interface RequestMappingMethods : Service {
    @RequestMapping(path = ["get-variable/{world}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getVariable(@PathVariable("world") world: String): String

    @RequestMapping(path = ["get-variables/{bar}/{foo}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getVariables(@PathVariable("foo") foo: String, @PathVariable("bar") bar: String): String

    @RequestMapping(path = ["get-variable-no-name/{world}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getVariableNoName(@PathVariable world: String): String

    @RequestMapping(path = ["put-variable/{world}"], method = [RequestMethod.PUT])
    @ResponseBody
    fun putVariable(@PathVariable("world") world: String): String

    @RequestMapping(path = ["delete/{world}"], method = [RequestMethod.DELETE])
    @ResponseBody
    fun delete(@PathVariable("world") world: String): String

    @RequestMapping(path = ["post"], method = [RequestMethod.POST])
    @ResponseBody
    fun post(@RequestBody foo: Foo): Foo

    @RequestMapping(path = ["request-param"], method = [RequestMethod.GET])
    @ResponseBody
    fun getRequestParam(@RequestParam("bar") bar: Int): Foo

    @RequestMapping(path = ["request-param"], method = [RequestMethod.POST])
    @ResponseBody
    fun postRequestParam(@RequestBody foo: Foo, @RequestParam("bar") bar: Int): Foo
}

@ServiceInterface
internal interface BasicMethods : Service {
    @RequestMapping(path = ["get-list/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getList(@PathVariable("world") world: String, @PathVariable count: Int): List<String>

    @RequestMapping(path = ["get-object-list/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getObjectList(@PathVariable("world") world: String, @PathVariable count: Int): List<Foo>

    @RequestMapping(path = ["get-object-array-list/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getObjectArrayList(@PathVariable("world") world: String, @PathVariable count: Int): ArrayList<Foo>

    @RequestMapping(path = ["get-array/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getArray(@PathVariable("world") world: String, @PathVariable count: Int): Array<String>

    @RequestMapping(path = ["get-map/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getMap(@PathVariable("world") world: String, @PathVariable count: Int): Map<String,Int>

    @RequestMapping(path = ["get-object-map/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getObjectMap(@PathVariable("world") world: String, @PathVariable count: Int): Map<String,Foo>

    @RequestMapping(path = ["get-object-array/{world}/{count}"], method = [RequestMethod.GET])
    @ResponseBody
    fun getObjectArray(@PathVariable("world") world: String, @PathVariable count: Int): Array<Foo>

    @GetMapping("/get-variable/{world}")
    @ResponseBody
    fun getVariable(@PathVariable("world") world: String): String

    @GetMapping("/get-variables/{bar}/{foo}")
    @ResponseBody
    fun getVariables(@PathVariable("foo") foo: String, @PathVariable("bar") bar: String): String

    @GetMapping("/get-variable-no-name/{world}")
    @ResponseBody
    fun getVariableNoName(@PathVariable world: String): String

    @PutMapping("/put-variable/{world}")
    @ResponseBody
    fun putVariable(@PathVariable("world") world: String): String

    @DeleteMapping("/delete/{world}")
    @ResponseBody
    fun delete(@PathVariable("world") world: String): String

    @PostMapping("/post")
    @ResponseBody
    fun post(@RequestBody foo: Foo): Foo

    @GetMapping("/get-request-params")
    @ResponseBody
    fun getRequestParams(@RequestParam foo: String, @RequestParam bar: Int, @RequestParam baz: Boolean): Foo

    @GetMapping("/get-request-param")
    @ResponseBody
    fun getRequestParam(@RequestParam("bar") bar: Int): Foo

    @PostMapping("/post-request-param")
    @ResponseBody
    fun postRequestParam(@RequestBody foo: Foo, @RequestParam("bar") bar: Int): Foo
}

@ComponentInterface(services = [BasicMethods::class, RequestMappingMethods::class, FluxMethods::class, ExceptionMethods::class])
internal interface TestComponent : com.serious.service.Component

@ComponentHost
internal class TestComponentImpl : AbstractComponent(), TestComponent {
    override val addresses: List<ChannelAddress>
        get() = listOf(ChannelAddress("rest", URI.create("http://localhost:$port")))
}

@Component
@RestController
internal class ExceptionMethodsImpl : ExceptionMethods {
    override fun throwDeclaredException(): String {
        throw NullPointerException()
    }

    override fun throwException(): String {
        throw NullPointerException()
    }
}

@Component
@RestController
internal class FluxMethodsImpl : FluxMethods {
    override fun get(world: String): Mono<String> {
        return Mono.just(world)
    }

    override fun getList(count: Int): Flux<Int> {
        val result: MutableList<Int> = ArrayList()
        for (i in 0 until count)
            result.add(i)

        return Flux.fromIterable(result)
    }
}

@Component
@RestController
internal class BasicMethodsImpl : BasicMethods {
    override fun getList(world: String, count: Int): List<String> {
        val result: MutableList<String> = ArrayList()
        for (i in 0 until count) result.add(world + i)
        return result
    }

    override fun getObjectList(world: String, count: Int): List<Foo> {
        val result: MutableList<Foo> = ArrayList()
        for (i in 0 until count) {
            val foo = Foo()
            foo.id = world + i
            result.add(foo)
        }
        return result
    }

    override fun getObjectArrayList(world: String, count: Int): ArrayList<Foo> {
        val result: ArrayList<Foo> = ArrayList()
        for (i in 0 until count) {
            val foo = Foo()
            foo.id = world + i
            result.add(foo)
        }
        return result
    }

    override fun getArray(world: String, count: Int): Array<String> {
        val result: MutableList<String> = ArrayList()
        for (i in 0 until count) {
            result.add(world + i)
        }
        return result.toTypedArray<String>()
    }

    override fun getMap(@PathVariable("world") world: String, @PathVariable count: Int): Map<String,Int> {
        return mapOf(Pair<String,Int>(world, count))
    }

    override fun getObjectMap(@PathVariable("world") world: String, @PathVariable count: Int): Map<String,Foo> {
        val foo = Foo()
        foo.id = world + count
        return mapOf(Pair(world, foo))
    }


    override fun getObjectArray(world: String, count: Int): Array<Foo> {
        val result: MutableList<Foo> = ArrayList()
        for (i in 0 until count) {
            val foo = Foo()
            foo.id = world + i
            result.add(foo)
        }
        return result.toTypedArray<Foo>()
    }

    override fun getVariable(world: String): String {
        return world
    }

    override fun getVariables(foo: String, bar: String): String {
        return foo + bar
    }

    override fun getVariableNoName(world: String): String {
        return world
    }

    override fun putVariable(world: String): String {
        return world
    }

    override fun delete(world: String): String {
        return world
    }

    override fun post(foo: Foo): Foo {
        return foo
    }

    override fun getRequestParams(foo: String, bar: Int, baz: Boolean): Foo {
        val result = Foo()
        result.id = "${foo}${bar}${baz}"
        return result
    }

    override fun getRequestParam(bar: Int): Foo {
        val foo = Foo()
        foo.id = bar.toString()
        return foo
    }

    override fun postRequestParam(foo: Foo, bar: Int): Foo {
        foo.id = bar.toString()
        return foo
    }
}

@Component
@RestController
internal class RequestMappingMethodsImpl : RequestMappingMethods {
    override fun getVariable(world: String): String {
        return world
    }

    override fun getVariables(foo: String, bar: String): String {
        return foo + bar
    }

    override fun getVariableNoName(world: String): String {
        return world
    }

    override fun putVariable(world: String): String {
        return world
    }

    override fun delete(world: String): String {
        return world
    }

    override fun post(foo: Foo): Foo {
        return foo
    }

    override fun getRequestParam(bar: Int): Foo {
        val foo = Foo()
        foo.id = bar.toString()
        return foo
    }

    override fun postRequestParam(foo: Foo, bar: Int): Foo {
        foo.id = bar.toString()
        return foo
    }
}

@Configuration
@ComponentScan
@Import(ServiceConfiguration::class)
open class TestConfig

@SpringBootTest(classes = [TestConfig::class], webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnableAutoConfiguration
internal class RestTest {
    // instance data

    @Autowired
    lateinit var serviceManager: ServiceManager

    // test
    @Test
    fun testBasicMethods() {
        val service = serviceManager.acquireService(BasicMethods::class.java)
        val foo = Foo()
        foo.id = "id"
        Assertions.assertEquals("world", service.delete("world"))
        Assertions.assertEquals("world", service.getVariable("world"))
        Assertions.assertEquals("world", service.getVariableNoName("world"))
        Assertions.assertEquals("id", service.post(foo).id)
        Assertions.assertEquals("foo1true", service.getRequestParams("foo", 1, true).id)
        Assertions.assertEquals("1", service.getRequestParam(1).id)
        Assertions.assertEquals("1", service.postRequestParam(foo, 1).id)
        Assertions.assertEquals("foobar", service.getVariables("foo", "bar"))
        Assertions.assertEquals("world", service.putVariable("world"))
        Assertions.assertEquals("world", service.getVariableNoName("world"))
        Assertions.assertEquals(2, service.getList("world", 2).size)
        Assertions.assertEquals(2, service.getObjectList("world", 2).size)
        Assertions.assertEquals(2, service.getObjectArrayList("world", 2).size)
        Assertions.assertEquals(2, service.getArray("world", 2).size)
        Assertions.assertEquals(2, service.getObjectArray("world", 2).size)
        Assertions.assertEquals(1, service.getMap("world", 1).get("world"))
        Assertions.assertEquals("world1", service.getObjectMap("world", 1).get("world")?.id)
    }

    @Test
    fun testRequestMappingMethods() {
        val service = serviceManager.acquireService(RequestMappingMethods::class.java)

        val foo = Foo()
        foo.id = "id"
        Assertions.assertEquals("world", service.delete("world"))
        Assertions.assertEquals("world", service.getVariable("world"))
        Assertions.assertEquals("world", service.getVariableNoName("world"))
        Assertions.assertEquals("id", service.post(foo).id)
        Assertions.assertEquals("1", service.getRequestParam(1).id)
        Assertions.assertEquals("1", service.postRequestParam(foo, 1).id)
        Assertions.assertEquals("foobar", service.getVariables("foo", "bar"))
        Assertions.assertEquals("world", service.putVariable("world"))
        Assertions.assertEquals("world", service.getVariableNoName("world"))
    }

    @Test
    fun testExceptions() {
        val service = serviceManager.acquireService(ExceptionMethods::class.java)

        try {
            service.throwDeclaredException()
        }
        catch(exception: NullPointerException) {
            // ok
        }

        try {
            service.throwException()
        }
        catch(exception: FatalException) {
            // ok
        }
    }

    @Test
    fun testFlux() {
        val service = serviceManager.acquireService(FluxMethods::class.java)

        // mono

        StepVerifier.create(service.get("world"))
            .expectNext("world")
            .verifyComplete()

        // flux

        StepVerifier.create(service.getList(2))
            .expectNext(0)
            .expectNext(1)
            .verifyComplete()
    }
}