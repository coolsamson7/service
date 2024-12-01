package org.sirius.common.type.base
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.type.Type

open class BooleanType : Type<Boolean>(Boolean::class.javaObjectType) {
    // override Type

     override fun computeDefaultValue() : Boolean {
        return false
    }

    // fluent

    fun isTrue() : BooleanType {
        test<Boolean>(
            "isTrue",
            null,
            {  obj -> obj }
        )

        return this
    }

    fun isFalse() : BooleanType {
        test<Boolean>(
            "isFalse",
            null,
            {  obj -> !obj }
        )

        return this
    }
}

fun boolean() : BooleanType {return BooleanType()
}