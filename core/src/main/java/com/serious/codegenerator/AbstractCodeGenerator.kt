package com.serious.codegenerator
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.PrintWriter

open class AbstractCodeGenerator {
    // local class

    class Writer(protected val writer: PrintWriter) {
        // instance data

        var indentation = 0

        // public

        fun indent() : Writer {
            for (i in 0..indentation - 1)
                this.print("\t")

            return this
        }

        fun splitLines(str: String, prefix: String = "") : Writer {
            for ( line in str.split("\n")) {
                indent().print(prefix).println(line)
            }

            return this
        }

        fun tab(delta: Int) : Writer {
            indentation += delta

            return this
        }

        fun flush() : Writer {
            this.writer.flush()

            return this
        }

        fun close() : Writer {

            this.writer.close()

            return this
        }

        // public

        fun print(str: String) : Writer {
            this.writer.print(str)

            return this
        }

        fun println(str: String = "") : Writer {
            this.writer.println(str)

            return this
        }
    }

    // instance data

    protected var writer = Writer(PrintWriter(System.out))

    // constructor

    constructor() {
        //this.writer = Writer(writer)
    }

    // protected

    fun simpleName(fqn: String) : String {
        return fqn.substring(fqn.lastIndexOf(".") + 1)
    }
}
