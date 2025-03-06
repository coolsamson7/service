package org.sirius.workflow

import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Target(AnnotationTarget.ANNOTATION_CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Parameter(
    val name: String,
    val type: KClass<*>,
    val description: String
)

@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
@Component
annotation class ServiceTask(
    val name : String = "",
    val description: String,
    val input: Array<Parameter> = [],
    val output: Array<Parameter> = []
)