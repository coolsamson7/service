package com.serious.service.registry.consul
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.ecwid.consul.v1.agent.model.NewService
import com.serious.service.*
import lombok.extern.slf4j.Slf4j
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.ServiceInstance
import org.springframework.cloud.client.discovery.DiscoveryClient
import org.springframework.cloud.client.discovery.event.HeartbeatEvent
import org.springframework.cloud.commons.util.InetUtils
import org.springframework.cloud.commons.util.InetUtilsProperties
import org.springframework.cloud.consul.discovery.ConsulDiscoveryProperties
import org.springframework.cloud.consul.serviceregistry.ConsulRegistration
import org.springframework.cloud.consul.serviceregistry.ConsulServiceRegistry
import org.springframework.context.ApplicationListener
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import java.util.*


/**
 * Listens to changes in consul and informs the registry.
 */
@Component
@Slf4j
internal class ConsulHeartbeatListener : ApplicationListener<HeartbeatEvent> {
    // instance data
    @Autowired
    var discoveryClient: DiscoveryClient? = null

    @Autowired
    var serviceInstanceRegistry: ServiceInstanceRegistry? = null

    @Autowired
    var componentManager: ComponentManager? = null
    private var state: Any? = null

    // override ApplicationListener

    override fun onApplicationEvent(event: HeartbeatEvent) {
        if (state == null || state != event.value) {
            log.info("process consul heartbeat")

            val services = discoveryClient!!.services.stream()
                .filter { service: String? -> componentManager!!.componentDescriptors.containsKey(service) }
                .toList()

            // create new map

            val newMap: MutableMap<String, List<ServiceInstance>> = HashMap()

            for (service in services)
                newMap[service] = discoveryClient!!.getInstances(service)

            // set

            serviceInstanceRegistry!!.update(newMap)

            // done
            state = event.value
        }
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(this::class.java)
    }
}

/**
 * A [ComponentRegistry] based on consul
 */
@Component
class ConsulComponentRegistry : ComponentRegistry {
    // instance data

    @Autowired
    lateinit var consulServiceRegistry: ConsulServiceRegistry

    @Autowired
    lateinit private var environment: Environment

    @Autowired
    lateinit var discoveryClient: DiscoveryClient
    var properties = ConsulDiscoveryProperties(InetUtils(InetUtilsProperties()))
    var registeredServices: MutableMap<ComponentDescriptor<*>, ConsulRegistration> = HashMap()
    private val port: String?
        get() = AbstractComponent.port

    private fun getId(descriptor: ComponentDescriptor<com.serious.service.Component>): String {
        //ServiceAddress serviceAddress = descriptor.getExternalAddress();
        val host = properties.ipAddress //serviceAddress.getUri().getHost();
        val port = port
        return host + ":" + port + ":" + descriptor.name
    }

    private fun properties4(descriptor: ComponentDescriptor<com.serious.service.Component>): ConsulDiscoveryProperties {
        properties.port = properties.port //serviceAddress.getUri().getPort());
        properties.instanceId = getId(descriptor)
        properties.healthCheckPath = descriptor.health
        return properties
    }

    private fun service4(descriptor: ComponentDescriptor<com.serious.service.Component>): NewService {
        val props = properties4(descriptor)

        // service

        val service = NewService()
        val meta: MutableMap<String, String> = HashMap()

        // build channels

        val channels = StringBuilder()

        // something like: rest(http://bla:90),http("https://hhh:90)
        var first = true
        for (external in descriptor.externalAddresses!!) {
            if (!first) channels.append(",")
            channels
                .append(external.channel)
                .append("(")
                .append(external.uri.toString())
                .append(")")

            first = false
        }
        meta["channels"] = channels.toString()

        // set properties

        service.port = props.port
        service.id = props.instanceId
        service.meta = meta
        service.address = props.ipAddress
        service.tags = Arrays.stream(arrayOf("component")).toList()
        //service.setEnableTagOverride(serviceTemplate.getEnableTagOverride());

        // check

        val check = NewService.Check()

        check.interval = environment.getProperty("spring.cloud.consul.discovery.health-check-interval", "15s")
        check.http = "http://" + props.ipAddress + ":" + port + descriptor.health
        check.timeout = environment.getProperty("spring.cloud.consul.discovery.health-check-timeout", "90s")
        check.deregisterCriticalServiceAfter = environment.getProperty("health-check-critical-timeout", "3m")
        service.check = check

        // add stuff
        service.name = descriptor.name
        service.id = getId(descriptor)

        // done
        return service
    }

    // implement ComponentRegistry
    override fun startup(descriptor: ComponentDescriptor<com.serious.service.Component>) {
        val registration = ConsulRegistration(
            service4(descriptor),
            properties4(descriptor)
        )
        registeredServices[descriptor] = registration
        consulServiceRegistry.register(registration)
    }

    override fun shutdown(descriptor: ComponentDescriptor<com.serious.service.Component>) {
        consulServiceRegistry.deregister(registeredServices[descriptor])
    }

    override fun getInstances(service: String): List<ServiceInstance> {
        return discoveryClient.getInstances(service)
    }

    override fun getServices(): List<String> {
        return discoveryClient.services
    }
}
