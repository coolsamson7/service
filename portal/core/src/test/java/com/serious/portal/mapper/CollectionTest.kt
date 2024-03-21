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
        var name: String = "line"
    }


    // test

    @Test
    fun testVersion() {
        val mapper = Mapper(
            Mapping.build(Foo::class, Foo::class) {
                map { "barArray" to "barList" deep true}
                map { "barList" to "barArray" deep true}
            },


            Mapping.build(Bar::class, Bar::class) {
                map { properties() }
            }
        )

        val foo = Foo()

        val result = mapper.map<Foo>(foo)


        // eq

        //assertEquals(true, Version("1.0").eq(Version("1.0")), "expected eq")
        //assertEquals(false, Version("1.0").eq(Version("1.1.1.1")), "expected !eq")
    }
}