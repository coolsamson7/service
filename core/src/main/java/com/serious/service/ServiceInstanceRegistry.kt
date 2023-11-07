package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelInvocationHandler.Companion.updateTopology
import lombok.extern.slf4j.Slf4j
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.ServiceInstance
import org.springframework.stereotype.Component
import java.io.Serializable
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

    class TopologyUpdate : Serializable {
        // instance data

        private var deletedServices : MutableList<String> = LinkedList()
        private var addedServices   : MutableList<String> = LinkedList()
        private var deletedInstances: MutableMap<String, MutableList<ServiceInstance>> = HashMap()
        private var addedInstances  : MutableMap<String, MutableList<ServiceInstance>> = HashMap()

        // public

        fun involvesService(service : String) : Boolean {
            return deletedInstances.containsKey(service) || addedInstances.containsKey(service)
        }

        fun getDeletedServices(): List<String> {
            return deletedServices
        }
        fun getAddedServices(): List<String> {
            return addedServices
        }

        fun getAddedInstances():Map<String, List<ServiceInstance>> {
            return addedInstances
        }

        fun getDeletedInstances():Map<String, List<ServiceInstance>> {
            return deletedInstances
        }


        fun getDeletedInstances(service: String): MutableList<ServiceInstance> {
            return deletedInstances.computeIfAbsent(service) { _: String? -> LinkedList() }
        }

        fun getAddedInstances(service: String): MutableList<ServiceInstance> {
            return addedInstances.computeIfAbsent(service) { _: String? -> LinkedList() }
        }

        // public
        fun isDeleted(instance: ServiceInstance?): Boolean {
            for (instances in deletedInstances.values)
                if (instances.contains(instance)) return true

            return false
        }

        fun deletedServices(service: String, instances: List<ServiceInstance>) {
            deletedServices.add(service)

            for (serviceInstance in instances)
                deletedService(service, serviceInstance)
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
            addedServices.add(service)

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
    private val listener = ArrayList<TopologyListener>();

    // public

     fun addListener(listener: TopologyListener) {
         this.listener.add(listener)
     }

    fun startup() {
        // fill initial services

        val initialInstances: MutableMap<String, List<ServiceInstance>> = ConcurrentHashMap()

        for (componentDescriptor in ComponentDescriptor.descriptors.values)
            initialInstances[componentDescriptor.name] = componentRegistry.getInstances(componentDescriptor.name)

        // first incremental update needed for unresolved injected services

        this.update(initialInstances)
    }

    // private

    private fun extractAddresses(channels: String): List<ChannelAddress> {
        return Arrays.stream(channels.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray())
            .map { channel: String ->
                val lparen = channel.indexOf("(")
                val rparen = channel.indexOf(")")
                val protocol = channel.substring(0, lparen)
                val uri = URI.create(channel.substring(lparen + 1, rparen))

                ChannelAddress(protocol, uri)
            }
            .collect(Collectors.toList())
    }

     public fun getServices(): List<String> {
         return ArrayList(serviceInstances.keys)
     }

    public fun getInstances(component: String): List<ServiceInstance> {
        val instances = serviceInstances[component]

        return instances ?: emptyList()
    }

    fun getServiceAddress(component: String, preferredChannel: String? = null): ServiceAddress? {
        val instances = getInstances(component)
        val addresses: MutableMap<ServiceInstance, List<ChannelAddress>> = HashMap()

        // extract addresses

        for (instance in instances)
            addresses[instance] = extractAddresses(instance.metadata["channels"]!!)

        // figure out a matching channel

        var channelName: String? = null
        if (!instances.isEmpty()) {
            if (preferredChannel === null) {
                channelName = addresses[instances[0]]!![0].channel
            }
            else {
                for (instance in instances) {
                    for (address in addresses[instance]!!)
                        if (channelName == null && preferredChannel == address.channel) {
                        channelName = address.channel
                        break
                    }
                    if (channelName != null) break
                } // for
            }
        }

        return if (channelName != null) {
            val instances = instances.stream()
                .filter { serviceInstance: ServiceInstance ->
                    addresses[serviceInstance]!!
                        .stream().anyMatch { address: ChannelAddress -> address.channel == channelName }
                }
                .collect(Collectors.toList())

            return ServiceAddress(component, channelName, instances)
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

    private fun topologyUpdate(oldMap: Map<String, List<ServiceInstance>>, newMap: Map<String, List<ServiceInstance>>): TopologyUpdate {
        val topologyUpdate = TopologyUpdate()
        val oldKeys = oldMap.keys
        for (service in oldKeys) {
            if (!newMap.containsKey(service)) topologyUpdate.deletedServices(
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
                        topologyUpdate.deletedService(service, oldInstances[instanceId])

                for (instanceId in newInstances.keys)
                    if (!oldInstanceIds.contains(instanceId))
                        topologyUpdate.addedService(service, newInstances[instanceId])
            }
        }

        for (service in newMap.keys)
            if (!oldMap.containsKey(service))
                topologyUpdate.addedServices(service, newMap[service]!!)

        return topologyUpdate
    }

    fun update(newMap: MutableMap<String, List<ServiceInstance>>) {
        val topologyUpdate = topologyUpdate(serviceInstances, newMap)

        // set new map, so channels can already adapt

        serviceInstances = newMap

        // check for necessary updates

        for ( listener in this.listener)
            listener.update(topologyUpdate) // they are also interested about helath updates?

        if (!topologyUpdate.isEmpty) {
            // inform listener

            updateTopology(this, topologyUpdate)
        }
    }

     companion object {
         val log: Logger = LoggerFactory.getLogger(ServiceInstanceRegistry::class.java)
     }
}
