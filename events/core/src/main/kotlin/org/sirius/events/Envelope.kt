package org.sirius.events

abstract class Envelope(val event: Any) {
    abstract fun setBody(body: String)

    abstract fun get(key: String) : String

    abstract fun set(key: String, value: String)
}