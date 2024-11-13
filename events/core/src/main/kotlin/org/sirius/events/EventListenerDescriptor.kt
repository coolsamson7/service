package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.springframework.beans.factory.config.BeanDefinition
import kotlin.reflect.KClass

data class EventListenerDescriptor(
    val beanDefinition : BeanDefinition,
    val event: EventDescriptor,
    var instance : AbstractEventListener<Any>? = null
)