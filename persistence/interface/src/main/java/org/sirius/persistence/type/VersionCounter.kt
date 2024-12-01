package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable
import java.math.BigDecimal


data class VersionCounter
@JvmOverloads constructor(var counter: Long = 0) : Serializable, Comparable<VersionCounter>, Cloneable {
    // secondary constructors

    constructor(counter: BigDecimal) : this(counter.toLong())

    constructor(counter: String) : this(counter.toLong())

    // public

    fun increment(): VersionCounter {
        counter++

        return this
    }

    fun incremented(): VersionCounter {
        return VersionCounter(counter + 1)
    }

    // implement Comparable

    override fun compareTo(other: VersionCounter): Int {
        return counter.compareTo(other.counter)
    }
}