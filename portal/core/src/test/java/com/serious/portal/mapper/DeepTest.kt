package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class DeepTest {
    // local classes

     class Foo {
         var bar: Bar = Bar()
     }

    class Bar {
        var name: String = ""
    }

    // test

    @Test
    fun testDeep() {
        val mapper = Mapper(
            mapping(Foo::class, Foo::class) {
                map { "bar" to "bar" deep true}
            },

            mapping(Bar::class, Bar::class) {
                map { "name" to "name" }
            }
        )

        val foo = Foo()
        foo.bar.name = "name"

        val result = mapper.map<Foo>(foo)!!

        assertEquals("name", result.bar.name)
    }
}