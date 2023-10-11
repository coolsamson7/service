package com.serious.service

import lombok.Getter
import org.springframework.cloud.client.ServiceInstance
import java.net.URI
import java.util.*
import java.util.stream.Collectors

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@Getter
class ServiceAddress {
    // instance data
    var channel: String? = null
    var uri: URI? = null
    var serviceInstance: ServiceInstance? = null

    // constructor
    constructor()
    constructor(channel: String?, uri: URI?) {
        this.channel = channel
        this.uri = uri
    }

    constructor(channel: String, instance: ServiceInstance) {
        this.channel = channel
        serviceInstance = instance
        uri = getAddress(channel, instance)!!.uri //instance.getUri();
    }

    // override Object
    override fun equals(o: Any?): Boolean {
        if (this === o) return true
        return if (o !is ServiceAddress) false else channel == o.channel && uri == o.uri
    }

    override fun hashCode(): Int {
        return Objects.hash(channel, uri)
    }

    override fun toString(): String {
        val builder = StringBuilder()
        if (channel != null) {
            builder
                .append(channel).append("(")
                .append(uri.toString()).append(")")
        } else builder.append("-")
        return builder.toString()
    }

    companion object {
        // static methods
        private fun extractAddresses(channels: String?): List<ServiceAddress?> {
            return Arrays.stream(channels!!.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray())
                .map { channel: String ->
                    val lparen = channel.indexOf("(")
                    val rparen = channel.indexOf(")")
                    val protocol = channel.substring(0, lparen)
                    val uri = URI.create(channel.substring(lparen + 1, rparen))
                    ServiceAddress(protocol, uri)
                }
                .collect(Collectors.toList())
        }

        private fun getAddress(channel: String, instance: ServiceInstance): ServiceAddress? {
            val addresses = extractAddresses(instance.metadata["channels"])
            return addresses.stream().filter { address: ServiceAddress? -> address!!.channel == channel }.findFirst()
                .orElse(null)
        }
    }
}
