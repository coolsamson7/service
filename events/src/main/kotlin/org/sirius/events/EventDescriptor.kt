package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.apache.activemq.artemis.api.core.client.ClientProducer

data class EventDescriptor(
    val name: String,
    val clazz :  Class<out Any>,
    val producer: ClientProducer
)