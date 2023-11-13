package com.serious.service.registry.consul
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.ecwid.consul.v1.ConsulClient
import com.ecwid.consul.v1.QueryParams
import com.ecwid.consul.v1.catalog.CatalogServicesRequest
import com.ecwid.consul.v1.health.HealthChecksForServiceRequest
import com.serious.service.ComponentAdministration
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.DefaultServiceInstance
import org.springframework.cloud.client.ServiceInstance
import org.springframework.stereotype.Component

@Component
class ConsulComponentAdministration : ComponentAdministration {
    // instance data

    @Autowired
    lateinit var consulClient: ConsulClient

    // public

    override fun getServices() : List<String> {
        val services = consulClient.getCatalogServices(
            CatalogServicesRequest.newBuilder()
                .build()).value // Map<String, List<String>>

        return services
            .filter { entry -> entry.value.contains("component") }
            .keys.toList()
    }

    override fun getNodes() : List<String> {
        val nodes = consulClient.getNodes(QueryParams.DEFAULT).value // Map<String, List<String>>

        return nodes
            .map { node -> node.node }
    }

    override fun getServiceInstances(serviceName: String) :List<ServiceInstance> {
        val catalogServices = consulClient.getCatalogService(serviceName, QueryParams.Builder.builder().build()).value

        return catalogServices.map { catalogService ->
            DefaultServiceInstance(
                catalogService.serviceId ,
                serviceName,
                catalogService.serviceAddress,
                catalogService.servicePort,
                false, // TODO
                catalogService.serviceMeta
            )
        }
    }

    override fun serviceHealths(serviceName: String) : Map<String, String> {
        val checks = consulClient.getHealthChecksForService(
            serviceName, HealthChecksForServiceRequest.newBuilder()
                .build()
        ).value

        val result = HashMap<String, String>();
        for ( check in checks )
            result.set(check.serviceId, check.status.toString())

        return result
    }

    override fun serviceHealth(serviceName: String, serviceId: String) :String {
        val checks = consulClient.getHealthChecksForService(
            serviceName, HealthChecksForServiceRequest.newBuilder()
                .build()
        ).value

        for (check in checks) {
            if (check.serviceId == serviceId)
                return check.status.toString()
        }

        return "unknown"
    }
}

