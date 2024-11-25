package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired


// TODO: maybe a pipeline if we need try/finally logic...

abstract class Eventing {
    // instance data

    @Autowired
    private lateinit var objectMapper : ObjectMapper

    // protected

    protected fun asEvent(json: String, clazz: Class<*>) : Any {
        try {
            return objectMapper.readValue(json, clazz)
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

    abstract fun create(event: Any) : Envelope

    abstract fun send(eventManager: EventManager, envelope: Envelope)

    // lifecycle

    open fun startup() {}

    open fun shutdown() {}
}