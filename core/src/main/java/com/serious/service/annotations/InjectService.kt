package com.serious.service.annotations
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD)
annotation class InjectService(val preferLocal: Boolean = false, val channels: Array<String> = []) 