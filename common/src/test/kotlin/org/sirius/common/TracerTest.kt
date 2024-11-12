package org.sirius.common
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.sirius.common.tracer.trace.ConsoleTrace
import org.junit.jupiter.api.Test


class TracerTest {
    @Test
    fun testTracer() {
        val tracer = Tracer(ConsoleTrace(), "%d{yyyy-MM-dd HH:mm:ss,SSS} %l{-6s} [%p{-10s}] %m")

        tracer
            .setTraceLevel("", TraceLevel.OFF)
            .setTraceLevel("com", TraceLevel.LOW)
            .setTraceLevel("com.sirius", TraceLevel.MEDIUM)

        assert(!tracer.isTraced("", TraceLevel.FULL))
        assert(tracer.isTraced("com", TraceLevel.LOW))
        assert(tracer.isTraced("com.foo.bar", TraceLevel.LOW))

        Tracer.trace("com.sirius", TraceLevel.LOW, "hello world")
        Tracer.trace("com.sirius", TraceLevel.MEDIUM, "hello world")

    }
}