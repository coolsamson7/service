package com.serious.exception
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */
open class FatalException : RuntimeException {
    constructor(message: String) : super(message) {}

    constructor(throwable: Throwable) : super(throwable) {}
}