package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class EventListenerDescriptor(
    val name: String,
    val group: String,
    val perProcess: Boolean,
    val event: EventDescriptor,
    val instance : AbstractEventListener<Any>
)

