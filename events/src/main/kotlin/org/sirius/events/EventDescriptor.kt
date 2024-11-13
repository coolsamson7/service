package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

data class EventDescriptor(
    val name: String,
    val clazz :  Class<out Any>,
    val broadcast: Boolean
)