package com.serious.lang
/**
 *  @COPYRIGHT (C) 2023 Andreas Ernst
 * All rights reserved
 */

import java.lang.reflect.Field
import java.lang.reflect.Proxy

 /**
 *
 */
object Annotations {
    // methods
    /**
     * Changes the annotation value for the given key of the given annotation to newValue and returns
     * the previous value.
     */
    fun changeAnnotationValue(annotation: Annotation?, key: String, newValue: Any): Any {
        val handler: Any = Proxy.getInvocationHandler(annotation)
        val field: Field
        field = try {
            handler.javaClass.getDeclaredField("memberValues")
        } catch (e: NoSuchFieldException) {
            throw IllegalStateException(e)
        } catch (e: SecurityException) {
            throw IllegalStateException(e)
        }
        field.setAccessible(true)
        val memberValues: MutableMap<String, Any>
        memberValues = try {
            field[handler] as MutableMap<String, Any>
        } catch (e: IllegalArgumentException) {
            throw IllegalStateException(e)
        } catch (e: IllegalAccessException) {
            throw IllegalStateException(e)
        }
        val oldValue = memberValues[key]
        require(!(oldValue == null || oldValue.javaClass != newValue.javaClass))
        memberValues[key] = newValue
        return oldValue
    }
}