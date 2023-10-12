package com.serious.service.channel.dispatch
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.springframework.stereotype.Component
import java.lang.reflect.Method
import java.util.*

 /**
 * A <code>MethodCache</code> is used to compute and cache method indices of classes.
  * Methods will be sorted by comparing their signature in order to be stable.
 */
@Component
class MethodCache {
    // local classes
    private class ClassMethods(var clazz: Class<*>) {
        var method2Index: MutableMap<Method, Int> = HashMap()
        var index2Method: MutableMap<Int, Method> = HashMap()

        // constructor
        init {
            analyze()
        }

        // private
        fun analyze() {
            val methods = Arrays.asList(*clazz.getMethods()) // do we need getDeclaredMethods + superclass traversal?

            methods.sortWith(Comparator.comparing { method: Method -> getSignature(method) })

            for ((index, method) in methods.withIndex()) {
                method2Index[method] = index
                index2Method[index] = method
            }
        }
    }

    // instance data

    private var class2Methods: MutableMap<Class<*>, ClassMethods> = HashMap()

    // public
    fun getIndex(clazz: Class<*>, method: Method): Int {
        return getClassMethods(clazz).method2Index[method]!!
    }

    fun getMethod(clazz: Class<*>, index: Int): Method {
        return getClassMethods(clazz).index2Method[index]!!
    }

    // private

    private fun getClassMethods(clazz: Class<*>): ClassMethods {
        return class2Methods.computeIfAbsent(clazz) { cl: Class<*> -> ClassMethods(cl) }
    }

    companion object {
        // static methods
        private fun getSignature(method: Method): String {
            val sb = StringBuilder(32)
            sb.append(method.name)
            sb.append('(')
            val params = method.parameterTypes
            for (i in params.indices) {
                sb.append(getParamSignature(params[i]))
                if (i < params.size - 1) sb.append(',')
            } // for
            sb.append(')')
            return sb.toString()
        }

        private fun getParamSignature(clazz: Class<*>): String {
            var clazz = clazz
            val sb = StringBuilder(32)
            if (clazz.isArray) {
                var dimensions = 0
                while (clazz.isArray) {
                    dimensions++
                    clazz = clazz.componentType
                }
                sb.append(clazz.getName())
                for (i in 0 until dimensions) sb.append("[]")
            } // if
            else sb.append(clazz.getName())

            return sb.toString()
        }
    }
}
