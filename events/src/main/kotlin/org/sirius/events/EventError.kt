package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import kotlin.Throwable

class EventError : Error {
    constructor(message: String) : super(message) {}

    constructor(message: String, throwable: Throwable) : super(message, throwable) {}
}