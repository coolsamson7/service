package org.sirius.common.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
class Test<T>(
    val type: Class<T>,
    /**
     * the name of the test ( e.g. "min" )
     */
    val name: String,
    /**
     * any parameters that specify the test arguments
     */
    val parameter: Any?,
    /**
     * optional message that will be used on a violation
     */
    //val message?: string
    /**
     * the test implementation
     * @param object the to be validated object
     */
    val check: Check<T>,
    /**
     * if <code>true</code> the test chain will stop since the missing tests rely on this test result and will fail for sure
     */
    val stop: Boolean = false,
    /**
     * if <code>true</code> a negative test result will not issue a violation
     */
    var ignore: Boolean = false
)