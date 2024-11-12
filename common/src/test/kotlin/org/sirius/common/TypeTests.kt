package org.sirius.common
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.type.base.*
import kotlin.test.Test

class TypeTests {
    // string
    @Test
    fun testString() {
        assert(!string().isValid(1))

        assert(string().isValid(""))

        assert(string().length(2).isValid("12"))

        assert(!string().length(2).isValid("123"))
    }

    // boolean

    @Test
    fun testBoolean() {
        assert(!boolean().isValid(1))

        assert(boolean().isValid(true))
    }

    // numbers

    @Test
    fun testShort() {
        assert(!short().isValid(1))
        assert(short().isValid(1.toShort()))

        assert(short().greaterEqual(0).isValid(1.toShort()))
        assert(!short().greaterEqual(0).isValid(-1.toShort()))
    }

    @Test
    fun testInt() {
        assert(!int().isValid(1f))
        assert(int().isValid(1))

        assert(int().greaterEqual(0).isValid(1))
        assert(!int().greaterEqual(0).isValid(-1))
    }

    @Test
    fun testLong() {
        assert(!long().isValid(1))
        assert(long().isValid(1L))

        assert(long().greaterEqual(0).isValid(1L))
        assert(!long().greaterEqual(0).isValid(-1L))
    }

    @Test
    fun testFloat() {
        assert(!float().isValid(1))
        assert(float().isValid(1f))

        assert(float().greaterEqual(0.0f).isValid(1f))
        assert(!float().greaterEqual(0.0f).isValid(-1f))
    }

    @Test
    fun testDouble() {
        assert(!double().isValid(1))
        assert(double().isValid(1.toDouble()))

        assert(double().greaterEqual(0.toDouble()).isValid(1.toDouble()))
        assert(!double().greaterEqual(0.toDouble()).isValid(-1.toDouble()))
    }

    @Test
    fun testChar() {
        assert(!character().isValid(1))
        assert(character().isValid('a'))
    }
}