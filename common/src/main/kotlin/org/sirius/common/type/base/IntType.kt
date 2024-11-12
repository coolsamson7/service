package org.sirius.common.type.base
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.sirius.common.type.DefaultValue
import org.sirius.common.type.Type

class IntType : Type<Int>(Int::class.javaObjectType) {
    // override Type

    override fun computeDefaultValue() : DefaultValue<Int> {
        return { -> 0 }
    }

    // fluent

    fun min(min: Int) : IntType {
        test<Int>(
            "min",
            min,
            {  obj -> obj >= min }
        )

        return this
    }

    fun max(max: Int) : IntType {
        test<Int>(
            "max",
            max,
            {  obj -> obj <= max }
        )

        return this
    }

    fun lessThan(value: Int) : IntType {
        test<Int>(
            "lessThan",
            value,
            {  obj -> obj < value }
        )

        return this
    }

    fun lessEqual(value: Int) : IntType {
        test<Int>(
            "lessEqual",
            value,
            {  obj -> obj <= value }
        )

        return this
    }

    fun greaterThan(value: Int) : IntType {
        test<Int>(
            "greaterThan",
            value,
            {  obj -> obj > value }
        )

        return this
    }

    fun greaterEqual(value: Int) : IntType {
        test<Int>(
            "greaterEqual",
            value,
            {  obj -> obj >= value }
        )

        return this
    }
}

fun int() : IntType {return IntType()
}