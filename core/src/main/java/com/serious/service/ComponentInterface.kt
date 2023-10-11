package com.serious.service

import kotlin.reflect.KClass

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */ /**
 * @author Andreas Ernst
 */
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
annotation class ComponentInterface(
    val name: String = "",
    val description: String = "",
    val services: Array<KClass<out Service>>
) 