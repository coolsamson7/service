package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.springframework.cloud.client.ServiceInstance
import java.net.URI
import java.util.*
import java.util.stream.Collectors

/**
 * A <code>ServiceAddress</code> is a resolved [ChannelAddress]
 */
data class ServiceAddress(var channel: String, var serviceInstances: List<ServiceInstance>) {

    override fun toString(): String {
        val builder = StringBuilder()

        builder
            .append(channel).append("(")

        for ( instance in serviceInstances  )
            builder.append(instance.toString())

        builder
            .append(")")

        return builder.toString()
    }

    companion object {
        // static methods
        private fun extractAddresses(channels: String): List<ChannelAddress?> {
            return Arrays.stream(channels.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray())
                .map { channel: String ->
                    val lparen = channel.indexOf("(")
                    val rparen = channel.indexOf(")")
                    val protocol = channel.substring(0, lparen)
                    val uri = URI.create(channel.substring(lparen + 1, rparen))

                    ChannelAddress(protocol, uri)
                }
                .collect(Collectors.toList())
        }

        /*private fun getAddress(channel: String, instance: ServiceInstance): ServiceAddress? {
            val addresses = extractAddresses(instance.metadata["channels"])
            return addresses.stream().filter { address: ServiceAddress? -> address!!.channel == channel }.findFirst()
                .orElse(null)
        }*/
    }
}
