package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.stereotype.Component
import kotlin.reflect.KClass
import kotlin.reflect.jvm.ExperimentalReflectionOnLambdas
import kotlin.reflect.jvm.jvmErasure
import kotlin.reflect.jvm.reflect

typealias Conversion<I, O> = (I) -> O

@Component("types")
class DataConversion {
    data class ConversionKey(val from : KClass<*>, val to: KClass<*>)

    // instance data

    val conversions = HashMap<ConversionKey,Conversion<*,*>>()

    // init

    init {
        // short

        this.register {value: Short -> value }
        this.register {value: Short -> value.toInt() }
        this.register {value: Short -> value.toLong() }
        this.register {value: Short -> value.toDouble() }
        this.register {value: Short -> value.toFloat() }
        this.register {value: Short -> value.toString() }
        this.register {value: Short -> value.toInt() == 1 }

        // int

        this.register {value: Int -> value }
        this.register {value: Int -> value.toShort() }
        this.register {value: Int -> value.toLong() }
        this.register {value: Int -> value.toDouble() }
        this.register {value: Int -> value.toFloat() }
        this.register {value: Int -> value.toString() }
        this.register {value: Int -> value == 1 }

        // long

        this.register {value: Long -> value }
        this.register {value: Long -> value.toShort() }
        this.register {value: Long -> value.toInt() }
        this.register {value: Long -> value.toDouble() }
        this.register {value: Long -> value.toFloat() }
        this.register {value: Long -> value.toString() }
        this.register {value: Long -> value.toInt() == 1 }

        // double

        this.register {value: Double -> value }
        this.register {value: Double -> value.toInt().toShort() }
        this.register {value: Double -> value.toInt() }
        this.register {value: Double -> value.toLong() }
        this.register {value: Double -> value.toFloat() }
        this.register {value: Double -> value.toString() }
        this.register {value: Double -> value == 1.0 }

        // float

        this.register {value: Float -> value }
        this.register {value: Float -> value.toInt().toShort() }
        this.register {value: Float -> value.toInt() }
        this.register {value: Float -> value.toLong() }
        this.register {value: Float -> value.toDouble() }
        this.register {value: Float -> value.toString() }
        this.register {value: Float -> value.toDouble() == 1.0 }

        // string

        this.register {value: String -> value }
        this.register {value: String -> value.toInt().toShort() }
        this.register {value: String -> value.toInt() }
        this.register {value: String -> value.toLong() }
        this.register {value: String -> value.toFloat() }
        this.register {value: String -> value.toDouble() }
        this.register {value: String -> value == "true" }
    }

    // private

    @OptIn(ExperimentalReflectionOnLambdas::class)
    fun <I:Any,O:Any> register(conversion: Conversion<I,O>) {
        val from = conversion.reflect()!!.parameters[0].type.jvmErasure
        val to = conversion.reflect()!!.returnType.jvmErasure

        conversions.put(ConversionKey(from,to), conversion)
    }

    fun <I:Any,O:Any> findConversion(from : KClass<I>, to: KClass<O>) :Conversion<I,O>? {
        return conversions.get(ConversionKey(from,to)) as Conversion<I,O>?
    }

    // public

    fun convert2(input: String, type: String)  : Any {
        val clazz = when (type) {
            "String" -> String::class
            "Short" -> Short::class
            "Integer" -> Int::class
            "Long" -> Long::class
            "Double" -> Double::class
            "Boolean" -> Boolean::class
            else -> {
                String::class
            }

        }
        return this.findConversion(String::class, clazz)?.invoke(input)!!
    }
}