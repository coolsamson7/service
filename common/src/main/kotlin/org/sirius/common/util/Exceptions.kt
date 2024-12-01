package org.sirius.common.util
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import sun.misc.Unsafe

/**
 * Utility class that deals with exceptions.
 *
 * @author Andreas Ernst
 */
class Exceptions {
    companion object {
        // required to avoid startup issues with the security manager.

        var UNSAFE: Unsafe? = null

        init {
            try {
                val field = Unsafe::class.java.getDeclaredField("theUnsafe")
                field.isAccessible = true

                UNSAFE = field[null] as Unsafe
            }
            catch (e: Exception) {
                throw AssertionError(e)
            }
        }

        /**
         * Rethrow any throwable, even checked exceptions blindly. :-)
         *
         * @param e the exception
         */

        fun throwException(e: Throwable?) {
            UNSAFE!!.throwException(e)
        }

    }
}