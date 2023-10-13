package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * A `ChannelFactory` is a factory for - guess what - [Channel]s
 */
interface ChannelFactory {
    /**
     * create a new [Channel] based on the specified [ServiceAddress].
     * @param componentClass the component class
     * @param addresses a [ServiceAddress]
     * @return the created [Channel]
     */
    fun makeChannel(componentClass: Class<out Component>, addresses: ServiceAddress): Channel
}
