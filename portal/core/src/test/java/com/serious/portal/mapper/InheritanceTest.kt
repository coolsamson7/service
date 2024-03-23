package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals


class InheritanceTest {
    // local classes

    open class Base {
        var id = "id"
    }

    open class Derived : Base() {
        var name = "name"
    }

    // test

    @Test
    fun testInheritance() {
        val baseMapping = Mapping.build(Base::class,Base::class) {
            map { properties() }
        }

        val mapper = Mapper(
            baseMapping,

            Mapping.build(Derived::class, Derived::class) {
                derives(baseMapping)

                map { properties("name") }
            }
        )

        val source = Derived()

        source.id = "base"
        source.name = "source"

        val result = mapper.map<Derived>(source)

        assertEquals(result?.id, "base")
        assertEquals(result?.name, "source")
    }
}