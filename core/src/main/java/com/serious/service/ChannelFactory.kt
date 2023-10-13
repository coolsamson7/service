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
     *
     * @param serviceAddresses a list of [ServiceAddress]
     * @return the created [Channel]
     */
    fun makeChannel(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>): Channel
}
