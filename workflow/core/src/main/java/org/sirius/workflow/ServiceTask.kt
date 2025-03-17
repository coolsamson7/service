package org.sirius.workflow

import org.springframework.stereotype.Component

@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
@Component
annotation class ServiceTask(
    val name : String = "",
    val description: String = ""
)