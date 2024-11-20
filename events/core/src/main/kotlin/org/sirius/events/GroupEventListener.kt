package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

class GroupEventListener<T>(val list: MutableList<AbstractEventListener<T>>) : AbstractEventListener<T> {
    // implement AbstractEventListener
    override fun on(event: T) {
        for ( listener in list)
            listener.on(event)
    }
}