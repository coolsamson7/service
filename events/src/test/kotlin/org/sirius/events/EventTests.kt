package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.sirius.common.tracer.trace.ConsoleTrace
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import java.util.concurrent.CompletableFuture
import kotlin.test.assertEquals

@Configuration
@ComponentScan(basePackages = ["org.sirius.events"])
class TestConfiguration {
    @Bean
    @Primary
    fun objectMapper(): ObjectMapper {
        return ObjectMapper()
        //setSerializationInclusion(JsonInclude.Include.NON_NULL)
        //.registerModule(ObjectDescriptorModule())
    }
}

@Event
data class HelloEvent(
    val hello : String = ""
)

@Event(name = "other")
data class OtherEvent(
    val hello : String = ""
)

@EventListener(event = HelloEvent::class)
class HelloEventListener : AbstractEventListener<HelloEvent>() {
    override fun on(event: HelloEvent) {
        EventTests.future.complete(event.hello)
    }
}

@SpringBootTest(classes = [TestConfiguration::class, EventConfiguration::class])
internal class EventTests {
    // instance data

    @Autowired
    lateinit var eventManager: EventManager

    // test

    @Test
    fun test() {
        Tracer.trace("org.sirius", TraceLevel.FULL, "test" )

        eventManager.send(HelloEvent("world"))

        val value = future.get()

        assertEquals("world", value)
    }

    companion object {
        val future = CompletableFuture<String>()

        @JvmStatic
        @BeforeAll
        fun setupTracer(): Unit {
            val tracer = Tracer(ConsoleTrace(), "%d{yyyy-MM-dd HH:mm:ss,SSS} %l{-6s} [%p{-10s}] %m")

            tracer.setTraceLevel("org.sirius", TraceLevel.FULL)
        }
    }
}