package com.serious.portal.version
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals


class VersionTest {
    @Test
    fun testRange() {
        assertEquals(true, VersionRange(">1.0,<2.0").matches(Version("1.1")), "expected match")
        assertEquals(false, VersionRange(">1.0,<2.0").matches(Version("1.0")), "expected match")
        assertEquals(true, VersionRange(">1.0,<=2.0").matches(Version("2.0")), "expected match")
        assertEquals(false, VersionRange(">1.0,<=2.0").matches(Version("3.0")), "expected match")

        assertEquals(true, VersionRange(">1.0").matches(Version("1.1")), "expected match")
        assertEquals(false, VersionRange(">1.0").matches(Version("1.0")), "expected match")
    }

    @Test
    fun testVersion() {
        // eq

        assertEquals(true, Version("1.0").eq(Version("1.0")), "expected eq")
        assertEquals(false, Version("1.0").eq(Version("1.1.1.1")), "expected !eq")

        // lt

        assertEquals(true, Version("1.0").lt(Version("1.1")), "expected lt")
        assertEquals(true, Version("1.0").lt(Version("1.0.1")), "expected lt")
        assertEquals(false, Version("1.0").lt(Version("1.0")), "expected !lt")
        assertEquals(false, Version("2.0").lt(Version("1.0")), "expected !lt")

        // le

        assertEquals(true, Version("1.0").le(Version("1.1")), "expected le")
        assertEquals(true, Version("1.0").le(Version("1.0")), "expected lt")
        assertEquals(false, Version("1.1").le(Version("1.0")), "expected !lt")

        // gt

        assertEquals(true, Version("2.0").gt(Version("1.1")), "expected gt")
        assertEquals(true, Version("2.0").gt(Version("1")), "expected gt")
        assertEquals(false, Version("1.0").gt(Version("1.0")), "expected !gt")
        assertEquals(false, Version("2.0").gt(Version("2.1")), "expected !gt")

        // ge

        assertEquals(true, Version("2.0").ge(Version("1.1")), "expected ge")
        assertEquals(true, Version("1.0").ge(Version("1.0")), "expected ge")
        assertEquals(false, Version("1.0").ge(Version("2.0")), "expected !ge")
    }
}