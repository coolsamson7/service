package org.sirius.common.bean
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.validation.Constraint
import org.sirius.common.type.Type
import kotlin.reflect.KClass

@Constraint(validatedBy = [AttributeValidator::class])
@MustBeDocumented
@Target(
    AnnotationTarget.PROPERTY
)
@Retention(AnnotationRetention.RUNTIME)
annotation class Attribute(
    /**
     * return the index of this attribute in the property list of the declaring bean starting with 0
     *
     * @return the index
     */
    val index: Int = -1,
    /**
     * return `true`, if this attribute is mutable, `false` otherwise.
     *
     * @return the required property
     */
    val mutable: Boolean = false,
    /**
     * return `true`, if this attribute is the primary key, `false` otherwise.
     *
     * @return the primary key property
     */
    val primaryKey: Boolean = false,
    /**
     * return `true`, if this attribute belongs to the object version, `false` otherwise.
     *
     * @return the version key property
     */
    val version: Boolean = false,
    /**
     * return the [Type] class that is used to describe
     * the specific type.
     *
     * @return the responsible [Type] class
     */
    val type: KClass<out Type<*>> = Type::class,
)
