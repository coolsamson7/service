package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.*
import com.serious.service.administration.ComponentIntrospectionService
import com.serious.service.administration.model.ChannelDTO
import com.serious.service.administration.model.ComponentDTO
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController


@Component
@RestController
class ComponentIntrospectionServiceImpl : ComponentIntrospectionService {
    // instance data

    private val executor = ServiceExecutor()

    // implement

    override fun fetchComponent(component: String) : ComponentDTO {
        val componentDescriptor = ComponentDescriptor.forName(component)!!

        return ComponentDTO(
            component,
            componentDescriptor.label,
            componentDescriptor.description,
            componentDescriptor.getModel(),
            componentDescriptor.externalAddresses!!.map { address ->  ChannelDTO(address.channel, listOf(address.uri)) })
    }

    override fun fetchComponentServices(component: String) : List<String> {
        val componentDescriptor = ComponentDescriptor.forName(component)!!

        return componentDescriptor.getModel().services.map { servce -> servce.name }
    }

    override fun listServices(component: String): Collection<InterfaceDescriptor> {
        val componentDescriptor = ComponentDescriptor.forName(component)

        return componentDescriptor!!.getModel().services
    }

    override fun executeMethod(component: String, request: String) : String {
        return executor.execute(component, request)
    }
}