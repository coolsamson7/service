package com.serious.injection
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.lang.Keywords
import com.serious.service.ServiceConfiguration
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import java.lang.reflect.AccessibleObject
import kotlin.test.assertEquals

@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD)
annotation class InjectString(val value: String)

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class StringInjection @Autowired constructor(injectorFactory: InjectorFactory) :
    AbstractInjection<String, InjectString, Keywords?>(InjectString::class.java) {

    init {
        injectorFactory.registerInjection(this as Injection<Annotation, Any>)
    }

    // implement AbstractInjection

    override fun computeValue(targetObject: Any, accessibleObjectType: Class<*>, accessibleObject: AccessibleObject, annotation: InjectString, context: Keywords?): String {
        return annotation.value
    }
}

open class Hello {
    @InjectString("hello")
    lateinit var hello : String
}
@Component
class World : Hello() {
    @InjectString("world")
    lateinit var world : String
}

@Configuration
@ComponentScan
@Import(ServiceConfiguration::class)
open class TestConfig {
    init {
        println()
    }
}

@SpringBootTest(classes = [TestConfig::class])
@Import(TestConfig::class)
internal class InjectionTests {
    @Autowired
    lateinit var helloWorld : World

    @Test
    fun test() {
        assertEquals("hello", helloWorld.hello)
        assertEquals("world", helloWorld.world)
    }
}
