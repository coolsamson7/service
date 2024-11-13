package org.sirius.common.tracer
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

enum class TraceLevel {
    /**
     * trace level where no trace messages at all are outputted.
     */
    OFF,

    /**
     * trace level expressing low often tracing
     */
    LOW,

    /**
     * trace level expressing medium often tracing
     */
    MEDIUM,

    /**
     * trace level expressing verbose tracing
     */
    HIGH,

    /**
     * trace level where all trace messages are outputted.
     */
    FULL;

    // static methods

    /**
     * converts a trace level name to a TraceLevel instance.
     *
     * @param name trace level name
     * @return the according TraceLevel instance
     */
    fun forName(name: String?): TraceLevel? {
        for (level in entries)
            if (level.name.equals(name, ignoreCase = true))
                return level

        return null
    }

    // public

    /**
     * returns an int used for comparing trace levels.
     *
     * @return an int
     */
    fun getLevel(): Int {
        return ordinal
    }
}
