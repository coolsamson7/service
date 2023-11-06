package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentAdministration
import com.serious.service.ServiceInstanceRegistry
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.ServiceInstance
import org.springframework.stereotype.Component

@Component
class LocalAdministration: ComponentAdministration {
    // instance data

    @Autowired
    lateinit var serviceInstanceRegistry: ServiceInstanceRegistry


    // implement
    override fun getServices(): List<String> {
        return serviceInstanceRegistry.getServices()
    }

    override fun getNodes(): List<String> {
        return emptyList()
    }

    override fun getServiceInstances(serviceName: String): List<ServiceInstance> {
        return serviceInstanceRegistry.getInstances(serviceName)
    }

    override fun serviceHealth(serviceName: String, serviceId: String): String {
        return "PASSING"
    }

    override fun serviceHealths(serviceName: String): Map<String, String> {
        return emptyMap()
    }
}