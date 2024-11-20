package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.beans.factory.config.BeanDefinition

class BeanEventListener<T>(private val factory: EventManager.ListenerFactory, private val beanDefinition: BeanDefinition) :
    AbstractEventListener<T> {
    // instance data

    @JvmField
    var instance : AbstractEventListener<T>? = null

    // private

    private fun getInstance() : AbstractEventListener<T> {
        if ( instance == null )
            instance = factory.make(beanDefinition)

        return instance!!
    }

    // implement AbstractEventListener
    override fun on(event: T) {
        getInstance().on(event)
    }
}