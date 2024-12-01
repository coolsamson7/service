package org.sirius.common.bean
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import org.sirius.common.type.Type


/**
 * An `AttributeValidator` is used to validate objects based on constraimnts
 * that are defined by specific [Attribute]-Annotations.
 *
 * @author Andreas Ernst
 * @see Attribute
 */
class AttributeValidator : ConstraintValidator<Attribute, Any?> {
    // instance data

    private var type: Type<Any>? = null
    private var required = false

    // implement

    override fun initialize(constraintAnnotation: Attribute) {
        //this.required = constraintAnnotation.required()

        val type  = constraintAnnotation.type

        if ( type !== Type::class)
            this.type = type.javaObjectType.newInstance() as Type<Any>//TODO TypeRegistry.getInstance().getTypeDescriptor(type)
    }

    override fun isValid(value: Any?, constraintValidatorContext: ConstraintValidatorContext?): Boolean {
        // check for null

        if (required && (value == null || value is String && value.isEmpty())) return false

        // check types

        return if ( type !== null ) type!!.isValid(value!!) else true
    }
}