package com.serious.exception
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.lang.reflect.InvocationTargetException
import java.lang.reflect.UndeclaredThrowableException

@RegisterExceptionHandler
class DefaultExceptionHandler : AbstractExceptionHandler() {
    fun log(e : Throwable) {
        println(e.message)
    }

    // unwrap

    fun unwrap(e : Throwable) : Throwable {
        return e
    }
    fun unwrap(e : UndeclaredThrowableException) : Throwable  {
        return ExceptionManager.proceed(e.undeclaredThrowable)
    }

    fun unwrap(e : InvocationTargetException) : Throwable {
        return ExceptionManager.proceed(e.targetException)
    }
}