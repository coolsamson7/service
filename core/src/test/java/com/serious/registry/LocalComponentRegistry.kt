package com.serious.registry
/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Component
import com.serious.service.ComponentDescriptor
import com.serious.service.ComponentRegistry
import com.serious.service.ServiceAddress
import org.springframework.cloud.client.ServiceInstance
import java.util.stream.Collectors

 /**
 * A local [ComponentRegistry] implementation used for test pruposes
 */
open class LocalComponentRegistry : ComponentRegistry {
    // instance data

    private var services: MutableMap<String, MutableList<ServiceAddress>> = HashMap()

    // implement ComponentRegistry
    override fun startup(descriptor: ComponentDescriptor<Component>) {
        val addresses = services.computeIfAbsent(
            descriptor.name
        ) { _: String? -> ArrayList() }

        addresses.addAll(descriptor.externalAddresses!!)
    }

    override fun shutdown(descriptor: ComponentDescriptor<Component>) {
        // noop
    }

    override fun getServices(): List<String> {
        return services.keys.stream().toList()
    }

    override fun getInstances(service: String): List<ServiceInstance> {
        return services[service]!!.stream()
            .map { address: ServiceAddress -> address.serviceInstance!! }
            .collect(Collectors.toList())
    }
}
