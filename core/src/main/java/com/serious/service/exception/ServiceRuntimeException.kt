package com.serious.service.exception
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * Any service related exception that occurs during the runtime.
 */
class ServiceRuntimeException : RuntimeException {
    constructor(message: String, vararg args: Any?) : super(String.format(message, *args))

    internal constructor(message: String, cause: Throwable?) : super(message, cause)
}