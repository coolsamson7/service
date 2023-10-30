package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentDescriptor
import com.serious.service.administration.ComponentIntrospectionService
import com.serious.service.administration.model.ChannelDTO
import com.serious.service.administration.model.ComponentDTO
import com.serious.service.administration.model.ServiceDTO
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RequestParam

@Component
class ComponentIntrospectionServiceImpl : ComponentIntrospectionService {
    // implement

    override fun fetchComponent(@RequestParam component: String) : ComponentDTO {
        val componentDescriptor = ComponentDescriptor.descriptors.get(component)!!

        return ComponentDTO(
            component,
            componentDescriptor.description,
            componentDescriptor.services.map { service -> ServiceDTO(service.name, service.description) },
            componentDescriptor.externalAddresses!!.map { address ->  ChannelDTO(address.channel, address.uri) })
    }

    override fun listServices(component: String): List<ServiceDTO> {
        val componentDescriptor = ComponentDescriptor.descriptors.get(component)

        return componentDescriptor!!.services.map { service -> ServiceDTO(service.name, service.description) }
    }
}