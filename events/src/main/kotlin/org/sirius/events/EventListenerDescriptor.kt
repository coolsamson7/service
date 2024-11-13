package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.springframework.beans.factory.config.BeanDefinition
import kotlin.reflect.KClass

data class EventListenerDescriptor(
    val name: String,
    val beanDefinition : BeanDefinition,
    val event: KClass<out Any>,
    var instance : AbstractEventListener<Any>? = null
)