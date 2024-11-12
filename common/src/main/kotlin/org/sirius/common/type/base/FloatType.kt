package org.sirius.common.type.base
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.sirius.common.type.DefaultValue
import org.sirius.common.type.Type

class FloatType : Type<Float>(Float::class.javaObjectType) {
    // override Type

    override fun computeDefaultValue() : DefaultValue<Float> {
        return { -> 0.0f }
    }

    fun min(min: Float) : FloatType {
        test<Float>(
            "min",
            min,
            {  obj -> obj >= min }
        )

        return this
    }

    fun max(max: Float) : FloatType {
        test<Float>(
            "max",
            max,
            {  obj -> obj <= max }
        )

        return this
    }

    fun lessThan(value: Float) : FloatType {
        test<Float>(
            "lessThan",
            value,
            {  obj -> obj < value }
        )

        return this
    }

    fun lessEqual(value: Float) : FloatType {
        test<Float>(
            "lessEqual",
            value,
            {  obj -> obj <= value }
        )

        return this
    }

    fun greaterThan(value: Float) : FloatType {
        test<Float>(
            "greaterThan",
            value,
            {  obj -> obj > value }
        )

        return this
    }

    fun greaterEqual(value: Float) : FloatType {
        test<Float>(
            "greaterEqual",
            value,
            {  obj -> obj >= value }
        )

        return this
    }
}

fun float() : FloatType {return FloatType()
}