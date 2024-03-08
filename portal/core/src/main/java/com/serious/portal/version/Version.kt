package com.serious.portal.version
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.*


class Version(version: String) {
    // instance data

    internal val numbers : ArrayList<Int>

    init {
        val tokenizer = StringTokenizer(version, ".")
        numbers = ArrayList()
        while (tokenizer.hasMoreElements())
            numbers.add(tokenizer.nextToken().toInt())
    }

    // internal

    internal fun pos(i: Int) : Int {
        return if ( i < numbers.size)
            numbers.get(i)
        else
            0
    }

    internal fun len() : Int {
        return this.numbers.size
    }

    // public

    fun eq(version: Version) :Boolean {
        // exactly same length

        if (this.len() != version.len())
            return false

        // and same elements

        for ( i in this.len() - 1 downTo 0 step -1)
            if ( this.pos(i) != version.pos(i))
                return false

        return true
    }

    fun lt(version: Version) :Boolean {
        val len = Math.max(this.numbers.size, version.numbers.size)

        var eq = true
        for ( i in 0..len-1) {
            if ( this.pos(i) < version.pos(i))
                return true
            else if (this.pos(i) != version.pos(i))
                eq = false
        }

        return !eq
    }

    fun le(version: Version) :Boolean {
        val len = Math.max(this.numbers.size, version.numbers.size)

        for (i in 0..len-1) {
            if ( this.pos(i) > version.pos(i))
                return false
        }

        return true
    }

    fun gt(version: Version) :Boolean {
        val len = Math.max(this.numbers.size, version.numbers.size)

        var eq = true
        for ( i in 0..len-1) {
            if ( this.pos(i) > version.pos(i))
                return true
            else if (this.pos(i) != version.pos(i))
                eq = false
        }

        return !eq
    }

    fun ge(version: Version) :Boolean {
        val len = Math.max(this.numbers.size, version.numbers.size)

        for (i in 0..len-1) {
            if ( this.pos(i) < version.pos(i))
                return false
        }

        return true
    }
}