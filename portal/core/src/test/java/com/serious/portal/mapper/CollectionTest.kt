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
        var barArray : Array<Bar>? = null// = arrayOf(Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar())
        var barList : List<Bar> = mutableListOf()//Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar())

        var name0: String = "bar"
        var name1: String = "bar"
        var name2: String = "bar"
        var name3: String = "bar"
        var name4: String = "bar"
        var name5: String = "bar"
        var name6: String = "bar"
        var name7: String = "bar"
    }

    class Bar {
        var name: String = "bar"

        var name0: String = "bar"
        var name1: String = "bar"
        var name2: String = "bar"
        var name3: String = "bar"
        var name4: String = "bar"
        var name5: String = "bar"
        var name6: String = "bar"
        var name7: String = "bar"

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
                map { "name0" to "name0" }
                map { "name1" to "name1" }
                map { "name2" to "name2" }
                map { "name3" to "name3" }
                map { "name4" to "name4" }
                map { "name5" to "name5" }
                map { "name6" to "name6" }
                map { "name7" to "name7" }

                map { "barArray" to "barList" deep true}
                map { "barList" to "barArray" deep true}
            },

            mapping(Bar::class, Bar::class) {
                map { properties() }
                map { "baz" to "baz" deep true}
            },

            mapping(Baz::class, Baz::class) {
                map { "name" to "name" }
            }
        )

        val foo = Foo()

        foo.barArray  = arrayOf(Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar())
        foo.barList = mutableListOf(Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar(), Bar())


        val result = mapper.map<Foo>(foo)!!

        while ( false ) {
            val loops = 100000
            var start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapper.map<Foo>(foo)

            var ms = System.currentTimeMillis() - start
            println("" + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)

        }

        //assertEquals(1, result.barArray.size)
        //assertEquals(1, result.barList.size)
        //assertEquals(1, result.barArray[0].baz.size)
        //assertEquals("baz", result.barArray[0].baz[0].name)

    //assertEquals(false, Version("1.0").eq(Version("1.1.1.1")), "expected !eq")
    }
}