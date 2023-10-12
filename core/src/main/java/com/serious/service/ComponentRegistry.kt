package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.springframework.cloud.client.ServiceInstance

 /**
 * @author Andreas Ernst
 */
interface ComponentRegistry {
    fun startup(descriptor: ComponentDescriptor<Component>)
    fun shutdown(descriptor: ComponentDescriptor<Component>)
    fun getServices() : List<String>
    fun getInstances(service: String): List<ServiceInstance>
}
