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
     * @param component the component name
     * @param addresses a [ServiceAddress]
     * @return the created [Channel]
     */
    fun makeChannel(component: String, addresses: ServiceAddress): Channel
}
