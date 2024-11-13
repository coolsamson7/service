package org.sirius.common.tracer.trace
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.tracer.Trace
import org.sirius.common.tracer.TraceEntry
import org.sirius.common.tracer.TraceFormatter

class ConsoleTrace : Trace() {
    // override

    override fun trace(entry: TraceEntry, format: TraceFormatter) {
        println(format.format(entry))
    }
}