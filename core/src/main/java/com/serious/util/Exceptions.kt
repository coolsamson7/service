package com.serious.util
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import sun.misc.Unsafe

/**
 * @author Andreas Ernst
 */
object Exceptions {
    // required to avoid startup issues with the security manager.

    var UNSAFE: Unsafe? = null

    init {
        try {
            val field = Unsafe::class.java.getDeclaredField("theUnsafe")
            field.setAccessible(true)
            UNSAFE = field[null] as Unsafe
        }
        catch (e: Exception) {
            throw AssertionError(e)
        }
    }

    // static methods
    /**
     * Rethrow any throwable, even checked exceptions blindly. :-)
     *
     * @param e the exception
     */
    fun throwException(e: Throwable?) {
        UNSAFE!!.throwException(e)
    }
}
