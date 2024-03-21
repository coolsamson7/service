package com.serious.portal.mapper

import kotlin.reflect.KClass

interface CompositeFactory {
    fun createComposite(clazz: KClass<*>, vararg arguments: Any?): Any
}