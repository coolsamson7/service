package com.serious.exception
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.beans.factory.annotation.Autowired

abstract class AbstractExceptionHandler : ExceptionManager.Handler {
    @Autowired
    lateinit var exceptionManager : ExceptionManager

    init {
        exceptionManager.register(this)
    }
}