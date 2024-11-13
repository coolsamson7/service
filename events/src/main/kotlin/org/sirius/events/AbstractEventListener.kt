package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
abstract class AbstractEventListener<T> {
    abstract fun on(event: T)
}