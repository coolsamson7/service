package org.sirius.workflow

import org.springframework.beans.factory.config.BeanDefinition

open class Descriptor<T>(
    val name : String,
    val description: String,
    val clazz : Class<T>,
    val bean: BeanDefinition
)