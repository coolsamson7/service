package com.serious.service

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */ /**
 * @author Andreas Ernst
 */
interface ChannelFactory {
    /**
     * create a new [Channel] based on the specified [ServiceAddress].
     *
     * @param serviceAddress a [ServiceAddress]
     * @return the created [Channel]
     */
    fun makeChannel(componentClass: Class<Component?>?, serviceAddresses: List<ServiceAddress?>?): Channel?
}
