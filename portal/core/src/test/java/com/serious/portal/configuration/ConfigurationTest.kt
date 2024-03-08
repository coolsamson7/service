package com.serious.portal.configuration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test

class ConfigurationTest {
    @Test
    fun test() {
        val merger = ConfigurationMerger()

        val c1 = "{\"type\":\"object\",\"value\": [{\"type\":\"string\",\"name\":\"foo\",\"value\":\"foo\"}]}"
        val c2 = "{\"type\":\"object\",\"value\": [{\"type\":\"string\",\"name\":\"bar\",\"value\":\"bar\"}]}"

        val result = merger.mergeConfigurationValues(c1, c2)

        println(result)
    }

}