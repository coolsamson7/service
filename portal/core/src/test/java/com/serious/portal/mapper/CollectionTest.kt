package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class CollectionTest {
    // local classes

    class Foo  {
        var barArray : Array<Bar> = arrayOf(Bar())
        var barList : List<Bar> = mutableListOf(Bar())
    }

    class Bar {
        var name: String = "bar"

        var baz : Array<Baz> = arrayOf(Baz())
    }

    class Baz {
        var name: String = "baz"
    }


    // test

    @Test
    fun testCollection() {
        val mapper = Mapper(
            mapping(Foo::class, Foo::class) {
                map { "barArray" to "barList" deep true}
                map { "barList" to "barArray" deep true}
            },

            mapping(Bar::class, Bar::class) {
                map { "name" to "name" }
                map { "baz" to "baz" deep true}
            },

            mapping(Baz::class, Baz::class) {
                map { "name" to "name" }
            }
        )

        val foo = Foo()

        val result = mapper.map<Foo>(foo)!!

        assertEquals(1, result.barArray.size)
        assertEquals(1, result.barList.size)
        assertEquals(1, result.barArray[0].baz.size)
        assertEquals("baz", result.barArray[0].baz[0].name)
        //assertEquals(false, Version("1.0").eq(Version("1.1.1.1")), "expected !eq")
    }
}