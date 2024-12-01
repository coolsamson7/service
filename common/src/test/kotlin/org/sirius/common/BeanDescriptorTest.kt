package org.sirius.common
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.validation.Validation
import org.junit.jupiter.api.Test
import org.sirius.common.bean.Attribute
import org.sirius.common.bean.BeanDescriptor
import org.sirius.common.type.base.StringType


class Str10 : StringType() {
    init {
        length(10)
    }
}

class Bean(
    @Attribute(primaryKey = true)
    var id: String = "",
    @Attribute(type = Str10::class)
    var name : String = ""
)

class BeanDescriptorTest {
    @Test
    fun testBean() {
        val descriptor = BeanDescriptor.ofClass(Bean::class)

        assert(descriptor.property("id") !== null)
    }

    @Test
    fun testValidation() {
        val factory = Validation.byDefaultProvider()
            .configure()
            //.messageInterpolator(ParameterMessageInterpolator())
            .buildValidatorFactory()
        val validator = factory.validator

        val violations = validator.validate(Bean("id", "1234567890123"))

        println()
    }
}