package com.serious.injection
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
class InjectionException : RuntimeException {
    constructor()
    constructor(cause: Throwable?) : super(cause)
    constructor(message: String?) : super(message)
    constructor(message: String?, cause: Throwable?) : super(message, cause)
}