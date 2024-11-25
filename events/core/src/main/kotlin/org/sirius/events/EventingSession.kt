package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

interface EventingSession {
    fun establishSession(sessionID: String)

    fun sessionID() : String
}