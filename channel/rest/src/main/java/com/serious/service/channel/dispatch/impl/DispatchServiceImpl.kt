package com.serious.service.channel.dispatch.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ComponentManager
import com.serious.service.Service
import com.serious.service.channel.dispatch.DispatchChannel.Companion.decodeFromString
import com.serious.service.channel.dispatch.DispatchChannel.Companion.decodeObject
import com.serious.service.channel.dispatch.DispatchChannel.Companion.encodeAsString
import com.serious.service.channel.dispatch.DispatchChannel.Companion.encodeObject
import com.serious.service.channel.dispatch.DispatchService
import com.serious.service.channel.dispatch.MethodCache
import com.serious.service.channel.dispatch.ServiceRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

/**
 * The implementation of a [DispatchService]
 */
@RestController
class DispatchServiceImpl : DispatchService {
    // instance data

    @Autowired
    lateinit var componentManager: ComponentManager

    @Autowired
    lateinit var methodCache: MethodCache

    // private
    private fun class4Name(className: String): Class<Service> {
        return Class.forName(className) as Class<Service>
    }

    // implement
    @PostMapping("/dispatch")
    @ResponseBody
    override fun dispatch(@RequestBody request: String): String {
        val serviceRequest = decodeObject(decodeFromString(request)) as ServiceRequest
        val serviceClass = class4Name(serviceRequest.service)
        val service = componentManager.acquireLocalService(serviceClass)
        val method = methodCache.getMethod(serviceClass, serviceRequest.method)

        return encodeAsString(encodeObject(method.invoke(service, *serviceRequest.arguments)))
    }
}
