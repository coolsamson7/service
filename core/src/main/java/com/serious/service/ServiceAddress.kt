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
data class ServiceAddress(var component: String, var channel: String, var serviceInstances: List<ServiceInstance>) {
    // instance data

    val uri : List<URI>

    init {
        uri = computeURIs()
    }

    fun changed(address : ServiceAddress) : Boolean {
        if ( channel != address.channel)
            return true

        if ( uri.size != address.uri.size )
            return true

        if ( !HashSet<URI>(uri).equals(HashSet<URI>(address.uri)))
            return false

        // actually we don't care...
        //if ( serviceInstances.size != address.serviceInstances.size )
        //    return true

        // oke

        return false
    }

    // private

    private fun computeURIs() :List<URI> {
        val result = HashSet<URI>()

        for (serviceInstance in serviceInstances ) {
            val channels = serviceInstance.metadata.get("channels")!!

            for ( channel in channels.split(",".toRegex())) {
                val lparen = channel.indexOf("(")
                val rparen = channel.indexOf(")")
                val protocol = channel.substring(0, lparen)

                if (protocol == this.channel)
                    result.add(URI.create(channel.substring(lparen + 1, rparen)))
            }
        }

        return result.toList()
    }

    // override

    override fun toString(): String {
        val builder = StringBuilder()

        builder
            //.append("<").append(component).append(">")
            .append(channel).append("(")

        for ( instance in serviceInstances  )
            builder.append(instance.toString())

        builder
            .append(")")

        return builder.toString()
    }

    companion object {
        fun localAddress(componentDescriptor: ComponentDescriptor<*>) : ServiceAddress {
            return ServiceAddress(componentDescriptor.name, "local", emptyList())
        }

        fun missingAddress(component: String) : ServiceAddress {
            return ServiceAddress(component, "missing", emptyList())
        }
    }
}
