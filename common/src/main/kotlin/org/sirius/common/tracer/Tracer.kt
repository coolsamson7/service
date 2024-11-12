package org.sirius.common.tracer
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.*

/**
 * A Tracer is used to emit trace messages for development purposes.
 * While it shares the logic of a typical logger, it will be turned of in production.
 */
class Tracer(private val trace: Trace, layout : String = "%d %l [%p] %m") {
    // instance data

    private val traceLevels = HashMap<String, TraceLevel>()
    private val cachedTraceLevels = HashMap<String, TraceLevel>()
    private var modifications = 0
    var formatter = TraceFormatter(layout)
    
    init {
        instance = this
    }
    
    // public

    fun isTraced(path: String, level: TraceLevel): Boolean {
        return this.getTraceLevel(path) >= level
    }

    fun trace(path: String, level: TraceLevel, message: String, vararg args: Any) {
        if (this.isTraced(path, level))
            this.trace.trace(TraceEntry(path, level, message.format(*args), Date()), formatter)
    }

    // private

    private fun getTraceLevel(path: String): TraceLevel {
        // check dirty state

        if (this.modifications > 0) {
            this.cachedTraceLevels.clear() // restart from scratch
            this.modifications = 0
        } // if

        var level = this.cachedTraceLevels[path]
        if (level == null) {
            level = this.traceLevels[path]
            if (level == null) {
                val index = path.lastIndexOf(".")
                level =
                    if ( index != -1 )
                        this.getTraceLevel(path.substring(0, index))
                    else (if (path != "") this.getTraceLevel("") else TraceLevel.OFF)
            } // if

            // cache

            this.cachedTraceLevels[path] = level
        } // if

        return level
    }

    fun setTraceLevel(path: String, level: TraceLevel) : Tracer {
        this.traceLevels[path] = level
        this.modifications++

        return this
    }
    
    companion object {
        val ENABLED = System.getProperty("tracing.enabled", "false").lowercase(Locale.getDefault()).equals("true")
        
        private lateinit var instance : Tracer

        // public

        fun isTraced(path: String, level: TraceLevel): Boolean {
            return ENABLED && instance.isTraced(path, level)
        }

        fun trace(path: String, level: TraceLevel, message: String, vararg args: Any) {
            instance.trace(path, level, message, *args)
        }
    }
}