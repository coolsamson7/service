package org.sirius.common.tracer
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
abstract class Trace {
    // abstract

    abstract fun trace(entry: org.sirius.common.tracer.TraceEntry, format: org.sirius.common.tracer.TraceFormatter)
}