package org.sirius.common.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
class ValidationContext() {
    // instance data


    var violations : MutableList<TypeViolation>? = null
    val path = ""

    // public

    fun addViolation(violation: TypeViolation) {
        if ( violations == null)
            violations = ArrayList()

        violations!!.add(violation)
    }
}