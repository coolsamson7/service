package org.sirius.common.tracer
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.text.SimpleDateFormat

abstract class Format() {
    open fun setup(parameters: String) {}

    abstract fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder)
}

class FormatString(val string: String) : org.sirius.common.tracer.Format() {
    // implement

    override fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder) {
        builder.append(string)
    }
}

class FormatMessage() : org.sirius.common.tracer.Format() {
    // implement

    override fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder) {
        builder.append(entry.message)
    }
}

class FormatLevel() : org.sirius.common.tracer.Format() {
    // instance data

    var format : String? = null

    // implement

    override fun setup(parameters: String) {
        this.format = parameters
    }

    override fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder) {
        if ( format != null)
            builder.append(String.format("%" + this.format!!, entry.level))
        else
            builder.append(entry.level)
    }
}

class FormatPath() : org.sirius.common.tracer.Format() {
    // instance data

    var format : String? = null

    // implement

    override fun setup(parameters: String) {
        this.format = parameters
    }

    override fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder) {
        if ( format != null)
            builder.append(String.format("%" + this.format!!, entry.path))
        else
            builder.append(entry.path)
    }
}

class FormatTimestamp() : org.sirius.common.tracer.Format() {
    // instance data

    var format = SimpleDateFormat("yyyy-MM-dd HH:mm:ss,SSS")

    // implement

    override fun setup(parameters: String) {
        println(parameters)
        format = SimpleDateFormat(parameters)
    }

    override fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder) {
        builder.append(format.format(entry.timestamp))
    }
}

class FormatThread() : org.sirius.common.tracer.Format() {
    // implement

    override fun format(entry: org.sirius.common.tracer.TraceEntry, builder: StringBuilder) {
        builder.append(Thread.currentThread().name)
    }
}

class TraceFormatter(layout: String) {
    // instance data

    private val formatter =  parse(layout)

    // init


    // private

    private fun parse(layout: String) : Array<org.sirius.common.tracer.Format>{
        val result = ArrayList<org.sirius.common.tracer.Format>()

        var start = 0
        var pos = start

        var parameter = false
        var lastFormat : org.sirius.common.tracer.Format? = null
        var inParameter = false

        while ( pos < layout.length) {
            if ( lastFormat != null) {
                if ( inParameter) {
                    if ( layout[pos] == '}') {
                        lastFormat.setup( layout.substring(start, pos))
                        start = pos + 1
                        lastFormat = null
                        inParameter = false
                    }
                }
                else {
                    if ( layout[pos] == '{') {
                        start++
                        inParameter = true
                    }
                    else
                        lastFormat = null
                }
            }

            else if ( parameter ) {
                val element =  layout[pos]

                lastFormat = when ( element ) {
                    'p' -> org.sirius.common.tracer.FormatPath()
                    'l' -> org.sirius.common.tracer.FormatLevel()
                    'd' -> org.sirius.common.tracer.FormatTimestamp()
                    't' -> org.sirius.common.tracer.FormatThread()
                    'm' -> org.sirius.common.tracer.FormatMessage()
                        else -> {
                            throw Error("unknown placeholder ${element}")
                        }
                }

                result.add(lastFormat)

                start = pos +1

                parameter = false
            }

            else if ( layout[pos] == '%') {
                if ( pos - start > 0) {
                    result.add(org.sirius.common.tracer.FormatString(layout.substring(start, pos)))
                }
                parameter = true
            }

            pos++
        } // while

        if ( pos - start > 0)
            result.add(org.sirius.common.tracer.FormatString(layout.substring(start, pos)))

        // done

        return result.toTypedArray()
    }

    // public

    fun format(entry: org.sirius.common.tracer.TraceEntry) : String {
        val builder = StringBuilder()

        for ( format in this.formatter)
            format.format(entry, builder)

        return builder.toString()
    }
}