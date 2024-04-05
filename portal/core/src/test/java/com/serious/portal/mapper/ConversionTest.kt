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

    data class Money(val currency: String, val value: Long)

    class Foo {
        var short : Short = 1
        var int : Int = 1
        var long : Long = 1
        var double : Double = 1.0
        var float : Float = 1.0f

        var shortN : Short? = 1
        var intN : Int? = 1
        var longN : Long? = 1
        var doubleN : Double? = 1.0
        var floatN : Float? = 1.0f

        var price: Money = Money("EU", 1)
    }

    // test

    @Test
    fun testConversion() {
        val mapper = mapper {
            mapping(Foo::class, Foo::class) {
                convert<Short,Float> { value -> value * 2f}

                map { Foo::short to Foo::short}
                map { "short" to "short" }
                map { "short" to "shortN" }
                map { "shortN" to "short" }

                map { "long" to "longN" convert {obj: Long? -> (2 * obj!!) }}

                map { "short" to "float" }
                map { "int" to "double" }
                map { "long" to "long" convert {obj: Long-> 2 * obj}}
                map { "double" to "int" }
                map { "float" to "short" }

                map { path("price", "currency") to  path("price", "currency") }
                map { "longN" to  path("price", "value") }
                }
        }

        val c =  {obj: Long-> 2 * obj}

        fun mapFoo(prod: Foo) : Foo {
            val result = Foo()

            result.short = prod.short
            result.short = prod.shortN!!

            result.long = c(prod.long)
            result.short = prod.float.toInt().toShort()
            result.int = prod.double.toInt()
            result.double = prod.int.toDouble()
            result.float = prod.short.toFloat()
            result.price = Money(prod.price.currency, prod.price.value)

            return result
        }

        val foo = Foo()
        val result = mapper.map<Foo>(foo)

        assertEquals(1, result?.short)

        val loops = 100000

        while (false) {
            var start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapper.map<Foo>(foo)

            var ms = System.currentTimeMillis() - start
            println("mapper: " + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)

            // low level

            start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapFoo(foo)

            ms = System.currentTimeMillis() - start
            println("manual:" + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)
        }
    }
}