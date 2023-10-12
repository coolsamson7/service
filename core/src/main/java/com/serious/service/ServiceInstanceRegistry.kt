package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelInvocationHandler.Companion.recheck
import lombok.extern.slf4j.Slf4j
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.ServiceInstance
import org.springframework.stereotype.Component
import java.net.URI
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.stream.Collectors

 /**
 * `ServiceInstanceRegistry` is responsible to cache the current known service instances.
 */
@Component
@Slf4j
class ServiceInstanceRegistry {
    // local classes

    class Delta {
        // instance data

        var deletedInstances: MutableMap<String, MutableList<ServiceInstance?>> = HashMap()
        var addedInstances: MutableMap<String, MutableList<ServiceInstance?>> = HashMap()

        // private
        fun getDeletedInstances(service: String): MutableList<ServiceInstance?> {
            return deletedInstances.computeIfAbsent(service) { _: String? -> LinkedList() }
        }

        fun getAddedInstances(service: String): MutableList<ServiceInstance?> {
            return addedInstances.computeIfAbsent(service) { _: String? -> LinkedList() }
        }

        // public
        fun isDeleted(instance: ServiceInstance?): Boolean {
            for (instances in deletedInstances.values) if (instances.contains(instance)) return true
            return false
        }

        fun deletedServices(service: String, instances: List<ServiceInstance>) {
            for (serviceInstance in instances) deletedService(service, serviceInstance)
        }

        fun deletedService(service: String, instance: ServiceInstance?) {
            log.info(" deleted {} instance {}", service, instance!!.instanceId)

            getDeletedInstances(service).add(instance)
        }

        fun addedService(service: String, instance: ServiceInstance?) {
            log.info(" added {} instance {}", service, instance!!.instanceId)

            getAddedInstances(service).add(instance)
        }

        fun addedServices(service: String, instances: List<ServiceInstance>) {
            for (serviceInstance in instances)
                addedService(service, serviceInstance)
        }

        val isEmpty: Boolean
            get() = addedInstances.isEmpty() && deletedInstances.isEmpty()
    }

    // instance data

    @Autowired
    lateinit var channelManager: ChannelManager

    @Autowired
    lateinit var componentRegistry: ComponentRegistry
    private var serviceInstances: MutableMap<String, List<ServiceInstance>> = ConcurrentHashMap()

    // public

    fun startup() {
        // fill initial services

        for (componentDescriptor in ComponentDescriptor.descriptors) {
            val instances = componentRegistry.getInstances(componentDescriptor.name)
            serviceInstances[componentDescriptor.name] = instances
        }
    }

    // private

    private fun extractAddresses(channels: String): List<ServiceAddress> {
        return Arrays.stream(channels.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray())
            .map { channel: String ->
                val lparen = channel.indexOf("(")
                val rparen = channel.indexOf(")")
                val protocol = channel.substring(0, lparen)
                val uri = URI.create(channel.substring(lparen + 1, rparen))
                ServiceAddress(protocol, uri)
            }
            .collect(Collectors.toList())
    }

    private fun getInstances(componentDescriptor: ComponentDescriptor<*>): List<ServiceInstance> {
        val instances = serviceInstances[componentDescriptor.name]

        return instances ?: ArrayList()
    }

    fun getServiceAddresses(
        componentDescriptor: ComponentDescriptor<*>,
        vararg preferredChannels: String?
    ): List<ServiceAddress>? {
        val instances = getInstances(componentDescriptor)
        val addresses: MutableMap<ServiceInstance, List<ServiceAddress>> = HashMap()

        // extract addresses

        for (instance in instances)
            addresses[instance] = extractAddresses(instance.metadata["channels"]!!)

        // figure out a matching channel

        var channelName: String? = null
        if (!instances.isEmpty()) {
            if (preferredChannels.size == 0) {
                channelName = addresses[instances[0]]!![0].channel
            }
            else {
                for (instance in instances) {
                    for (address in addresses[instance]!!)
                        if (channelName == null && Arrays.asList(*preferredChannels).contains(address.channel)) {
                        channelName = address.channel
                        break
                    }
                    if (channelName != null) break
                } // for
            }
        }

        return if (channelName != null) {
            val finalChannelName: String = channelName
            instances.stream()
                .filter { serviceInstance: ServiceInstance ->
                    addresses[serviceInstance]!!
                        .stream().anyMatch { address: ServiceAddress -> address.channel == finalChannelName }
                }
                .map { serviceInstance: ServiceInstance? -> ServiceAddress(finalChannelName, serviceInstance!!) }
                .collect(Collectors.toList())
        } else null
    }

    fun report() {
        val builder = StringBuilder()

        builder.append("Service Instances").append("\n")

        for (service in serviceInstances.keys) {
            val instances = serviceInstances[service]!!

            builder.append("Service ").append(service).append("\n")

            for (instance in instances) {
                builder
                    .append("\t").append(instance.uri)
                    .append("\n")
            } // for
        } // for

        println(builder)
    }

    private fun computeDelta(
        oldMap: Map<String, List<ServiceInstance>>,
        newMap: Map<String, List<ServiceInstance>>
    ): Delta {
        val delta = Delta()
        val oldKeys = oldMap.keys
        for (service in oldKeys) {
            if (!newMap.containsKey(service)) delta.deletedServices(
                service,
                oldMap[service]!!
            )
            else {
                // check instances

                val oldInstances: MutableMap<String, ServiceInstance> = HashMap()
                val newInstances: MutableMap<String, ServiceInstance> = HashMap()

                for (serviceInstance in oldMap[service]!!)
                    oldInstances[serviceInstance.instanceId] = serviceInstance
                for (serviceInstance in newMap[service]!!)
                    newInstances[serviceInstance.instanceId] = serviceInstance

                // compare maps

                val oldInstanceIds: Set<String> = oldInstances.keys
                for (instanceId in oldInstanceIds)
                    if (!newInstances.containsKey(instanceId))
                        delta.deletedService(service, oldInstances[instanceId])

                for (instanceId in newInstances.keys)
                    if (!oldInstanceIds.contains(instanceId))
                        delta.addedService(service, newInstances[instanceId])
            }
        }

        for (service in newMap.keys)
            if (!oldMap.containsKey(service))
                delta.addedServices(service, newMap[service]!!)

        return delta
    }

    fun update(newMap: MutableMap<String, List<ServiceInstance>>) {
        val delta = computeDelta(serviceInstances, newMap)

        if (!delta.isEmpty) {
            // recheck missing channels
            recheck(channelManager, delta)
        }

        // new map

        serviceInstances = newMap
    }

     companion object {
         val log: Logger = LoggerFactory.getLogger(this::class.java)
     }
}
