package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.cloud.client.ServiceInstance

interface ComponentAdministration {
    fun getServices() : List<String>

    fun getNodes() : List<String>

    fun getServiceInstances(serviceName: String) :List<ServiceInstance>

    fun serviceHealth(serviceName: String, serviceId: String) : String

    fun serviceHealths(serviceName: String) : Map<String, String>
}