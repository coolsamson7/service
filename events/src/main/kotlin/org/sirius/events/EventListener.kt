package org.sirius.events

import kotlin.reflect.KClass

@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
annotation class EventListener(
    val name: String = "",
    val event: KClass<out Any>
)