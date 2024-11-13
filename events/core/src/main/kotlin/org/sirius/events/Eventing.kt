package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired

abstract class Eventing {
    // instance data

    @Autowired
    private lateinit var objectMapper : ObjectMapper

    // protected

    protected fun asEvent(json: String, eventDescriptor: EventDescriptor) : Any {
        try {
            return objectMapper.readValue(json, eventDescriptor.clazz)
        }
        catch(exception: Throwable) {
            throw EventError(exception.message!!)
        }
    }

    protected fun asJSON(event: Any) : String {
        try {
            return objectMapper.writeValueAsString(event)
        }
        catch(exception: Throwable) {
            throw EventError(exception.message!!)
        }
    }

    // public

    abstract fun registerEvent(eventManager: EventManager, eventDescriptor: EventDescriptor)

    abstract fun registerEventListener(eventManager: EventManager, eventListenerDescriptor: EventListenerDescriptor)

    abstract fun send(eventManager: EventManager, event: Any)

    // lifecycle

    open fun startup() {}

    open fun shutdown() {}
}