package com.serious.collections

import java.util.*

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
object Arrays {
    fun <T> contains(array: Array<T>, element: T): Boolean {
        for (i in array.indices) if (array[i] === element) return true
        return false
    }

    @JvmStatic
    fun <T> add2(type: Class<T>?, a1: Array<T>, vararg a2: T): Array<T> {
        val result = java.lang.reflect.Array.newInstance(type, a1.size + a2.size) as Array<T>
        System.arraycopy(a1, 0, result, 0, a1.size)
        System.arraycopy(a2, 0, result, a1.size, a2.size)
        return result
    }

    fun <T> add2(type: Class<T>?, array: Array<T>, index: Int, value: T): Array<T> {
        val aLength = array.size
        val result = java.lang.reflect.Array.newInstance(type, aLength + 1) as Array<T>
        System.arraycopy(array, 0, result, 0, index)
        result[index] = value
        if (index < aLength) System.arraycopy(array, index, result, index + 1, aLength - index)
        return result
    }
}
