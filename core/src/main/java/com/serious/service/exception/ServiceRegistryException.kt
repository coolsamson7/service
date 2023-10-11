package com.serious.service.exception

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */ /**
 * @author Andreas Ernst
 */
class ServiceRegistryException : RuntimeException {
    // ServiceException
    constructor(message: String?, vararg args: Any?) : super(String.format(message!!, *args))
    internal constructor(message: String?, cause: Throwable?) : super(message, cause)
}