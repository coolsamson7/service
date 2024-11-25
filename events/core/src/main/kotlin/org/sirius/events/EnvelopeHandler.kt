package org.sirius.events

 interface EnvelopeHandler {
     fun send(envelope: Envelope)

     fun handle(envelope: Envelope, eventDescriptor: EventListenerDescriptor)
}

abstract class AbstractEnvelopeHandler(var next: EnvelopeHandler?) : EnvelopeHandler {
    fun proceedSend(envelope: Envelope) {
        next?.send(envelope)
    }

    fun proceedHandle(envelope: Envelope, eventDescriptor: EventListenerDescriptor) {
        next?.handle(envelope, eventDescriptor)
    }
}