package com.serious.service
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.cloud.client.ServiceInstance

interface ComponentAdministration {
    fun getServices() : List<String>

    fun getServiceInstances(serviceName: String) :List<ServiceInstance>

    fun serviceHealth(serviceName: String, serviceId: String) : String
}