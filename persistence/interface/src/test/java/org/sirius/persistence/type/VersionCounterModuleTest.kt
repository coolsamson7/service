package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class Foo {
    val version: VersionCounter = VersionCounter()
}


class VersionCounterModuleTest {
    @Test
    fun test() {
        val objectMapper = ObjectMapper()

        objectMapper.registerModules(VersionCounterModule())

        val str = objectMapper.writeValueAsString(Foo())

        val foo = objectMapper.readValue(str, Foo::class.java)

        assertEquals(0, foo.version.counter)
    }
}