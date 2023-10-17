package com.serious.exception
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import java.lang.NullPointerException
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.UndeclaredThrowableException


class TestHandler : ExceptionManager.Handler {
    // prexform

    fun prexform(e : Throwable) : Throwable {
        return e
    }
    fun prexform(e : UndeclaredThrowableException) : Throwable  {
        return ExceptionManager.proceed(e.undeclaredThrowable)
    }

    fun prexform(e : InvocationTargetException) : Throwable {
        return ExceptionManager.proceed(e.targetException)
    }

    // log

    fun log(e : Throwable) {
        println("log")
    }

    fun log(e : Exception) {
        ExceptionManager.proceed(e)
    }

    fun log(e : NullPointerException) {
        ExceptionManager.proceed(e)
    }
}

class ExceptionTests {
    @Test
    fun test() {
        val manager = ExceptionManager()

        manager.register(TestHandler())

        manager.handleException(UndeclaredThrowableException(NullPointerException()))
    }
}