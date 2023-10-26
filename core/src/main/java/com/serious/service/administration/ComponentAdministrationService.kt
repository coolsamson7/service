package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentAdministration
import com.serious.service.ServiceManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.ServiceInstance
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("administration/")
class ComponentAdministrationService {
    // instance data

    @Autowired
    lateinit var componentAdministration: ComponentAdministration
    @Autowired
    lateinit var serviceManager: ServiceManager

    // rest calls

    @GetMapping("/services")
    @ResponseBody
    fun services(): List<String> {
        return componentAdministration.getServices()
    }

    @GetMapping("/health/{service}/{service-id}")
    @ResponseBody
    fun serviceHealth(@PathVariable("service") serviceName: String, @PathVariable("service-id") serviceId: String): String {
        return componentAdministration.serviceHealth(serviceName, serviceId)
    }

    @GetMapping("/service-instances/{service}")
    @ResponseBody
    fun serviceInstances(@PathVariable("service") serviceName: String): List<ServiceInstance> {
        return componentAdministration.getServiceInstances(serviceName)
    }

    // calls that delegate to individual components

    @GetMapping("/component-services/{component}")
    @ResponseBody
    fun componentServices(@PathVariable component: String) : List<String> {
        val administration = serviceManager.acquireAdministrativeService(component, ComponentIntrospectionService::class.java)

        // go

        return administration.listServices(component)
    }
}