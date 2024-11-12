package org.sirius.common.tracer.trace
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.tracer.Trace
import org.sirius.common.tracer.TraceEntry
import org.sirius.common.tracer.TraceFormatter

class ConsoleTrace : org.sirius.common.tracer.Trace() {
    // override

    override fun trace(entry: org.sirius.common.tracer.TraceEntry, format: org.sirius.common.tracer.TraceFormatter) {
        println(format.format(entry))
    }
}