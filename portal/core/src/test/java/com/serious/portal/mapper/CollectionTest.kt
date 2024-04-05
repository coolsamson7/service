package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test

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
        val bazMapping = mapping(Baz::class, Baz::class) {
            map { "name" to "name" }
        }

        val mapper = mapper {
            convert<Long,Long> { value -> value }

            convert<Long,String> { value -> value.toString() }

            mapping(Foo::class, Foo::class) {
                map { matchingProperties() except properties("barArray", "barList") }

                map { "barArray" to "barList" deep true }
                map { "barList" to "barArray" deep true }
            }

            mapping(Bar::class, Bar::class) {
                map { matchingProperties() except properties("baz") }
                map { "baz" to "baz" deep true }
            }

            mapping(bazMapping)

            //(Baz::class, Baz::class) {
            //    map { "name" to "name" }
            //}
        }

        fun mapBaz(baz: Baz) :Baz {
            val result = Baz()

            result.name = baz.name

            return result
        }

        fun mapBar(bar: Bar) :Bar {
            val result = Bar()

            result.name = bar.name
            result.name0 = bar.name0
            result.name1 = bar.name1
            result.name2 = bar.name2
            result.name3 = bar.name3
            result.name4 = bar.name4
            result.name5 = bar.name5
            result.name6 = bar.name6
            result.name7 = bar.name7

            result.baz = bar.baz.map { baz -> mapBaz(baz) }.toTypedArray()

            return result
        }

        fun mapFoo(foo: Foo) :Foo {
            val result = Foo()

            result.name0 = foo.name0
            result.name1 = foo.name1
            result.name2 = foo.name2
            result.name3 = foo.name3
            result.name4 = foo.name4
            result.name5 = foo.name5
            result.name6 = foo.name6
            result.name7 = foo.name7

            result.barArray = foo.barArray!!.map { bar -> mapBar(bar) }.toTypedArray()
            result.barList = foo.barList!!.map { bar -> mapBar(bar) }

            return result
        }


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
            println("mapper: " + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)

            // manual

            start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapFoo(foo)

            ms = System.currentTimeMillis() - start
            println("manual: " + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)
        }

        //assertEquals(1, result.barArray.size)
        //assertEquals(1, result.barList.size)
        //assertEquals(1, result.barArray[0].baz.size)
        //assertEquals("baz", result.barArray[0].baz[0].name)

    //assertEquals(false, Version("1.0").eq(Version("1.1.1.1")), "expected !eq")
    }
}