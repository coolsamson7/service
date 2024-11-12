package org.sirius.common.type.base
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.sirius.common.type.DefaultValue
import org.sirius.common.type.Type

class StringType : Type<String>(String::class.java) {
    // override Type

    override fun computeDefaultValue() : DefaultValue<String> {
        return { -> "" }
    }

    // fluent

    fun length(length: Int/*, info?: ConstraintInfo*/) : StringType {
        this.test<String>(
            "length",
            length,
            { obj -> obj.length <= length }
        )

        return this
    }

    fun matches(expression: String/*, info?: ConstraintInfo*/) : StringType {
        val re = Regex(expression)
        this.test<String>(
            "matches",
            expression,
            { obj -> obj.matches(re) }
        )

        return this
    }
}

fun string() : StringType {return StringType()
}