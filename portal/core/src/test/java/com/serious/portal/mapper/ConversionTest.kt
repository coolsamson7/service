package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ConversionTest {
    // local classes

    class Foo {
        var short : Short = 1
        var int : Int = 1
        var long : Long = 1
        var double : Double = 1.0
        var float : Float = 1.0f
    }

    // test

    @Test
    fun testConversion() {
        val mapper = Mapper(
            Mapping.build(Foo::class, Foo::class) {
                map { "short" to "short" }
                map { "short" to "float" }
                map { "int" to "double" }
                map { "long" to "long" convert {obj: Long-> obj}}
                map { "double" to "int" }
                map { "float" to "short" }
                })

        val foo = Foo()
        val result = mapper.map<Foo>(foo)

        assertEquals(1, result?.short)
    }
}