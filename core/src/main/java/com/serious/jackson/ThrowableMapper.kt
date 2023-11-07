package com.serious.jackson
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

object ThrowableMapper {
    fun toJSON(throwable : Throwable) : String {
        return mapper.writeValueAsString(throwable)
    }

    fun fromJSON(json : String) : Throwable {
        return mapper.readValue(json, Throwable::class.java)
    }

    fun <T>fromJSON(json : String, clazz : Class<T>) : T {
        return mapper.readValue(json, clazz)
    }

    private val mapper = createObjectMapper()

    private fun createObjectMapper(): ObjectMapper {
        val mapper = ObjectMapper(null, null, DefaultDeserializationContext.Impl(
                object : BeanDeserializerFactory(DeserializerFactoryConfig()) {
                    private val serialVersionUID = 1L

                    @Throws(JsonMappingException::class)
                    override fun buildThrowableDeserializer(ctxt: DeserializationContext, type: JavaType, beanDesc: BeanDescription): JsonDeserializer<Any> {
                        return super.buildBeanDeserializer(ctxt, type, beanDesc)
                    }
                })
        )

        mapper
            .setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.NONE)
            .setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY)
            .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
            .addMixIn(Throwable::class.java, ThrowableMixin::class.java)
            .addMixIn(StackTraceElement::class.java, StackTraceElementMixin::class.java)

        return mapper
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, property = "@class")
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    @JsonIgnoreProperties(
        "message",
        "localizedMessage",
        "suppressed",
        "backtrace",
        "suppressedExceptions",
        "stackTrace",
        "cause"
    )
    internal abstract class ThrowableMixin {
        @JsonIdentityInfo(generator = IntSequenceGenerator::class, property = "\$id")
        private val cause: Throwable? = null
    }

    internal abstract class StackTraceElementMixin {
        @JsonProperty("className")
        private val declaringClass: String? = null
    }
}
