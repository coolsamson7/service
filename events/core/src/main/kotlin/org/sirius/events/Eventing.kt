package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

interface Eventing {
    // public

    fun registerEvent(eventManager: EventManager, eventDescriptor: EventDescriptor)

    fun registerEventListener(eventManager: EventManager, eventListenerDescriptor: EventListenerDescriptor)

    fun send(eventManager: EventManager, event: Any)

    // lifecycle

    fun startup()

    fun shutdown()
}