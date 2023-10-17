package com.serious.demo.impl

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


/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */

fun createObjectMapper(): ObjectMapper {
    val mapper = ObjectMapper(
        null, null, DefaultDeserializationContext.Impl(
            object : BeanDeserializerFactory(DeserializerFactoryConfig()) {
                private val serialVersionUID = 1L

                @Throws(JsonMappingException::class)
                override fun buildThrowableDeserializer(
                    ctxt: DeserializationContext, type: JavaType, beanDesc: BeanDescription
                ): JsonDeserializer<Any> {
                    return super.buildBeanDeserializer(ctxt, type, beanDesc)
                }
            })
    )
    mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.NONE)
    mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY)
    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
    mapper.addMixIn(Throwable::class.java, ThrowableMixin::class.java)
    mapper.addMixIn(StackTraceElement::class.java, StackTraceElementMixin::class.java)
    return mapper
}


@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonIgnoreProperties(
    "message",
    "localizedMessage",
    "suppressed",
    "detailMessage",
    "cause",
    "stackTrace",
    "suppressedExceptions"
)
internal abstract class ThrowableMixin {
    @JsonIdentityInfo(generator = IntSequenceGenerator::class, property = "\$id")
    private val cause: Throwable? = null
}


internal abstract class StackTraceElementMixin {
    @JsonProperty("className")
    private val declaringClass: String? = null
}


@RestController
internal class TestRemoteRestServiceImpl : TestRemoteRestService {
    /*@ExceptionHandler(AllowedException::class)
    fun handleAllowedException(exception: AllowedException): ResponseEntity<*> {
        val mapper = createObjectMapper()
        val str = mapper.writeValueAsString(exception.cause);

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(str)
    }*/
    @Throws(RuntimeException::class)
    override fun throwException(id: String): Void {
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
