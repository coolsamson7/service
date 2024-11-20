package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
interface AbstractEventListener<T> {
    fun on(event: T)
}