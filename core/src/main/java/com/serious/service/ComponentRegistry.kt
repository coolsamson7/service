package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.springframework.cloud.client.ServiceInstance

 /**
 * A `ComponentRegistry` is a registry for components.
 */
interface ComponentRegistry {
     /**
      * Startup
      *
      * @param descriptor
      */
    fun register(descriptor: ComponentDescriptor<Component>)

     /**
      * Shutdown
      *
      * @param descriptor
      */
    fun deregister(descriptor: ComponentDescriptor<Component>)

     /**
      * get the list of alive services
      *
      * @return
      */
    fun getServices() : List<String>

     /**
      * get the list of available service instances for a specific service
      *
      * @param service the service name
      * @return list of [ServiceInstance]
      */
    fun getInstances(service: String): List<ServiceInstance>
}
