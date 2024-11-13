package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

abstract class Eventing(val eventManager: EventManager) {
    // public

    abstract fun registerEvent(event: EventDescriptor)

    abstract fun registerEventListener(event: EventListenerDescriptor)

    abstract fun send(event: Any)

    // lifecycle

    abstract fun startup()

    abstract fun shutdown()
}