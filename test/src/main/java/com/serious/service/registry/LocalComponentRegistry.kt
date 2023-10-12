package com.serious.service.registry
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Component
import com.serious.service.ComponentDescriptor
import com.serious.service.ComponentRegistry
import com.serious.service.ServiceAddress
import com.serious.service.exception.ServiceRuntimeException
import org.springframework.cloud.client.ServiceInstance
import java.util.stream.Collectors

/**
 * A local [ComponentRegistry] implementation used for test pruposes
 */
//@org.springframework.stereotype.Component
open class LocalComponentRegistry : ComponentRegistry {
    // instance data

    private var services: MutableMap<String, MutableList<ServiceAddress>> = HashMap()

    // private

    private fun getServiceAddresses(service : String) :List<ServiceAddress> {
        return services[service] ?: throw ServiceRuntimeException("unknown service " + service)
    }

    // implement ComponentRegistry
    override fun startup(descriptor: ComponentDescriptor<Component>) {
        val addresses = services.computeIfAbsent(descriptor.name) { _: String? -> ArrayList() }
        addresses.addAll(descriptor.externalAddresses!!)
    }

    override fun shutdown(descriptor: ComponentDescriptor<Component>) {
        // noop
    }

    override fun getServices(): List<String> {
        return services.keys.stream().toList()
    }

    override fun getInstances(service: String): List<ServiceInstance> {
        return getServiceAddresses(service)
            .stream()
            .map { address: ServiceAddress -> address.serviceInstance!! }
            .collect(Collectors.toList())
    }
}
