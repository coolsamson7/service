package com.serious.exception

import java.lang.reflect.InvocationTargetException
import java.lang.reflect.UndeclaredThrowableException
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */
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