package com.serious.portal.configuration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import org.junit.jupiter.api.Test

class ConfigurationProperty(
    val type: String,
    val name: String,
    val value: Any?
) {
    constructor() : this("", "", null)
}

class ConfigurationTest {
    @Test
    fun test() {
        val merger = ConfigurationMerger()



        val c1 = "{\"type\":\"object\",\"value\": [{\"type\":\"string\",\"name\":\"foo\",\"value\":\"foo\"}]}"
        val c2 = "{\"type\":\"object\",\"value\": [{\"type\":\"string\",\"name\":\"bar\",\"value\":\"bar\"}]}"

        val mapper = ObjectMapper()
        //mapper.registerModule(KotlinModule())
        val bla  = mapper.readValue<Any>(c1)

        val result = merger.mergeConfigurationValues(c1, c2)

        println(result)
    }

}