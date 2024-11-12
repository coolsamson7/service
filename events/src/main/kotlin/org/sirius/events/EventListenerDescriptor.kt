package org.sirius.events

import org.springframework.beans.factory.config.BeanDefinition
import kotlin.reflect.KClass

data class EventListenerDescriptor(
    val name: String,
    val beanDefinition : BeanDefinition,
    val event: KClass<out Any>,
    var instance : AbstractEventListener<Any>? = null
)