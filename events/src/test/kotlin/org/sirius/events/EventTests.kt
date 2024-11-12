package org.sirius.events

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
import org.springframework.stereotype.Component

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

@Event(name = "hello")
data class HelloEvent(
    val hello : String = ""
)

@EventListener(event = HelloEvent::class)
@Component
class HelloEventListener : AbstractEventListener<HelloEvent>() {
    override fun on(event: HelloEvent) {
        println("##### on " + event.hello)

        System.exit(0)
    }
}

@SpringBootTest(classes = [TestConfiguration::class])
internal class EventTests {
    // instance data

    @Autowired
    lateinit var eventManager: EventManager

    // test

    @Test
    fun test() {
        Tracer.trace("org.sirius", TraceLevel.FULL, "test" )

        eventManager.send(HelloEvent("world"))
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun setupTracer(): Unit {
            val tracer = Tracer(ConsoleTrace(), "%d{yyyy-MM-dd HH:mm:ss,SSS} %l{-6s} [%p{-10s}] %m")

            tracer.setTraceLevel("org.sirius", TraceLevel.FULL)
        }
    }
}