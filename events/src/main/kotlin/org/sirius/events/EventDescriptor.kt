package org.sirius.events

import org.apache.activemq.artemis.api.core.client.ClientProducer

data class EventDescriptor(
    val name: String,
    val clazz :  Class<out Any>,
    val producer: ClientProducer
)