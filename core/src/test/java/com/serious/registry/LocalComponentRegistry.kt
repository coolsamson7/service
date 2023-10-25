package com.serious.registry
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.*
import com.serious.service.exception.ServiceRuntimeException
import org.springframework.cloud.client.DefaultServiceInstance
import org.springframework.cloud.client.ServiceInstance
import java.util.stream.Collectors

 /**
 * A local [ComponentRegistry] implementation used for test purposes
 */
 open class LocalComponentRegistry : ComponentRegistry {
     // instance data

     private var services: MutableMap<String, MutableList<ChannelAddress>> = HashMap()

     // implement ComponentRegistry
     override fun register(descriptor: ComponentDescriptor<Component>) {
         val addresses = services.computeIfAbsent(descriptor.name) { _: String? -> ArrayList() }
         addresses.addAll(descriptor.externalAddresses!!)
     }

     override fun deregister(descriptor: ComponentDescriptor<Component>) {
         // noop
     }

     override fun getServices(): List<String> {
         return services.keys.stream().toList()
     }

     override fun getInstances(service: String): List<ServiceInstance> {
         val meta : ( address: ChannelAddress ) -> Map<String,String> = {
                 address ->
             val result = HashMap<String,String>()
             result.put("channels", address.channel + "(" + address.uri.toString() + ")")
             result
         }

         if ( services.containsKey(service))
             return services[service]!!.stream()
                 .map { address: ChannelAddress ->
                     DefaultServiceInstance(
                         address.channel + ":" + address.uri.toString(),
                         service,
                         address.uri.host,
                         address.uri.port,
                         false,
                         meta(address)
                     )}
                 .collect(Collectors.toList())
         else return emptyList()
     }
 }
