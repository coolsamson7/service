package com.serious.service.annotations
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * Fields annotated with this annotation will inject the corresponding service proxy.
 */
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD)
annotation class InjectService(val preferLocal: Boolean = false, val channel: String = "")