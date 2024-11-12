package org.sirius.common.type.base
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.sirius.common.type.DefaultValue
import org.sirius.common.type.Type

class DoubleType : Type<Double>(Double::class.javaObjectType) {
    // override Type

    override fun computeDefaultValue() : DefaultValue<Double> {
        return { -> 0.0 }
    }

    fun min(min: Double) : DoubleType {
        test<Double>(
            "min",
            min,
            {  obj -> obj >= min }
        )

        return this
    }

    fun max(max: Double) : DoubleType {
        test<Double>(
            "max",
            max,
            {  obj -> obj <= max }
        )

        return this
    }

    fun lessThan(value: Double) : DoubleType {
        test<Double>(
            "lessThan",
            value,
            {  obj -> obj < value }
        )

        return this
    }

    fun lessEqual(value: Double) : DoubleType {
        test<Double>(
            "lessEqual",
            value,
            {  obj -> obj <= value }
        )

        return this
    }

    fun greaterThan(value: Double) : DoubleType {
        test<Double>(
            "greaterThan",
            value,
            {  obj -> obj > value }
        )

        return this
    }

    fun greaterEqual(value: Double) : DoubleType {
        test<Double>(
            "greaterEqual",
            value,
            {  obj -> obj >= value }
        )

        return this
    }
}

fun double() : DoubleType {return DoubleType()
}