package com.serious.service.exception
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * Any exception that occurs during setup of the service framework.
 */
class ServiceRegistryException : RuntimeException {
    constructor(message: String, vararg args: Any?) : super(String.format(message, *args))

    internal constructor(message: String, cause: Throwable?) : super(message, cause)
}