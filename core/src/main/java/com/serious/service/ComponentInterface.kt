package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import kotlin.reflect.KClass


/**
 * Marks [Component] interfaces
 */
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
annotation class ComponentInterface(
    val name: String = "",
    val description: String = "",
    val services: Array<KClass<out Service>>
) 