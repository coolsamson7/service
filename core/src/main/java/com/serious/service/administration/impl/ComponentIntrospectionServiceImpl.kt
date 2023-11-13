package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentDescriptor
import com.serious.service.InterfaceDescriptor
import com.serious.service.administration.ComponentIntrospectionService
import com.serious.service.administration.model.ChannelDTO
import com.serious.service.administration.model.ComponentDTO
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam

@Component
class ComponentIntrospectionServiceImpl : ComponentIntrospectionService {
    // implement

    override fun fetchComponent(@RequestParam component: String) : ComponentDTO {
        val componentDescriptor = ComponentDescriptor.descriptors.get(component)!!

        return ComponentDTO(
            component,
            componentDescriptor.description,
            componentDescriptor.getModel(),
            componentDescriptor.externalAddresses!!.map { address ->  ChannelDTO(address.channel, listOf(address.uri)) })
    }

    override fun fetchComponentServices(@PathVariable component: String) : List<String> {
        val componentDescriptor = ComponentDescriptor.descriptors.get(component)!!

        return componentDescriptor.getModel().services.map { servce -> servce.name }
    }

    override fun listServices(component: String): Collection<InterfaceDescriptor> {
        val componentDescriptor = ComponentDescriptor.descriptors.get(component)

        return componentDescriptor!!.getModel().services
    }
}