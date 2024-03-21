package com.serious.portal.mapper

import kotlin.reflect.KClass

interface ObjectFactory {
    /**
     * create a new instance of the specified class.
     *
     * @param source the source object
     * @param clazz  the class
     * @return the new instance
     */
    fun createInstance(source: Any?, clazz: KClass<*>): Any
}