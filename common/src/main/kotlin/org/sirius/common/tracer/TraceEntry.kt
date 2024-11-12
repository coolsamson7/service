package org.sirius.common.tracer
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.*


class TraceEntry(
    /*
     * the path
     */
    val path: String,
    /**
     * the level
     */
    val level: org.sirius.common.tracer.TraceLevel,
    /**
     * the formatted message
     */
    val message: String,
    /**
     * the timestamp
     */
    val timestamp : Date
)
