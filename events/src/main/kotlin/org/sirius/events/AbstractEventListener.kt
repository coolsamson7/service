package org.sirius.events

abstract class AbstractEventListener<T> {
    abstract fun on(event: T)
}