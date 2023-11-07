package com.serious.exception
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

class CommunicationException : FatalException {
    constructor(message: String) : super(message) {}

    constructor(throwable: Throwable) : super(throwable) {}
}