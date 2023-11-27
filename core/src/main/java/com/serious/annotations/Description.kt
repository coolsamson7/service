package com.serious.annotations

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD, AnnotationTarget.CLASS, AnnotationTarget.FUNCTION, AnnotationTarget.TYPE, AnnotationTarget.CONSTRUCTOR, AnnotationTarget.VALUE_PARAMETER)
annotation class Parameter(
    val name: String = "",
    val description: String
)


@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD, AnnotationTarget.CLASS, AnnotationTarget.FUNCTION, AnnotationTarget.TYPE, AnnotationTarget.CONSTRUCTOR, AnnotationTarget.VALUE_PARAMETER)
annotation class Description(
    val value: String = "",
    val parameters: Array<Parameter> = emptyArray()
)
