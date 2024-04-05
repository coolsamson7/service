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
        val baseMapping = mapping(Base::class,Base::class) {
            map { matchingProperties() }
        }

        val mapper = Mapper(
            baseMapping,

            mapping(Derived::class, Derived::class) {
                derives(baseMapping)

                map { matchingProperties("name") }
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