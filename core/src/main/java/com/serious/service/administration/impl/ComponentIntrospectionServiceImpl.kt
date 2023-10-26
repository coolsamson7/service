package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentDescriptor
import com.serious.service.administration.ComponentIntrospectionService
import org.springframework.stereotype.Component

@Component
class ComponentIntrospectionServiceImpl : ComponentIntrospectionService {
    // implement

    override fun listServices(component: String): List<String> {
        val componentDescriptor = ComponentDescriptor.descriptors.find { cmp -> cmp.name == component }

        return componentDescriptor!!.services.map { service -> service.name }
    }
}