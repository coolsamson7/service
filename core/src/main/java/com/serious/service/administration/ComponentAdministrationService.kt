package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.*
import com.serious.service.administration.model.ComponentDTO
import com.serious.service.administration.model.ServiceDTO
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.ServiceInstance
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.function.Consumer


// NEW

@Component
class Emitters : TopologyListener {
    // instance data

    var emitters: ArrayList<SseEmitter> = ArrayList()

    @Autowired
    lateinit var serviceInstanceRegistry: ServiceInstanceRegistry

    // constructor

    @PostConstruct
    fun init() {
        this.serviceInstanceRegistry.addListener(this)
    }

   // implement TopologyListener
    override fun update(update: ServiceInstanceRegistry.TopologyUpdate) {
        val failedEmitters: MutableList<SseEmitter> = ArrayList()

        for ( emitter in this.emitters)
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("update")
                        .id("id")
                        .data("update")
                )
                //emitter.complete()
            }
            catch (e: Exception) {
                emitter.completeWithError(e)
                failedEmitters.add(emitter)
            }

       emitters.removeAll(failedEmitters)
    }

    fun listenTo(component: String): SseEmitter {
        val emitter = SseEmitter(50000);

        emitter.onCompletion {
            println("emitter.onCompletion")
            emitters.remove(emitter)
        }

        emitter.onTimeout {
            println("emitter.onTimeout")
            //emitter.complete()
            //emitters.remove(emitter)
        }

        this.emitters.add(emitter) // TODO

        return emitter
    }
}

// NEW
@RestController
@RequestMapping("administration/")
class ComponentAdministrationService {
    // instance data

    @Autowired
    lateinit var componentAdministration: ComponentAdministration
    @Autowired
    lateinit var serviceManager: ServiceManager

    // rest calls

    @GetMapping("/services")
    @ResponseBody
    fun services(): List<String> {
        return componentAdministration.getServices()
    }

    @GetMapping("/nodes")
    @ResponseBody
    fun nodes(): List<String> {
        return componentAdministration.getNodes()
    }

    @GetMapping("/health/{service}/{service-id}")
    @ResponseBody
    fun serviceHealth(@PathVariable("service") serviceName: String, @PathVariable("service-id") serviceId: String): String {
        return componentAdministration.serviceHealth(serviceName, serviceId)
    }

    @GetMapping("/health/{service}")
    @ResponseBody
    fun serviceHealths(@PathVariable("service") serviceName: String): Map<String,String> {
        return componentAdministration.serviceHealths(serviceName)
    }

    @GetMapping("/service-instances/{service}")
    @ResponseBody
    fun serviceInstances(@PathVariable("service") serviceName: String): List<ServiceInstance> {
        return componentAdministration.getServiceInstances(serviceName)
    }

    // calls that delegate to individual components

    @GetMapping("/component/{component}")
    @ResponseBody
    fun fetchComponent(@PathVariable component: String) : ComponentDTO {
        val administration = serviceManager.acquireAdministrativeService(component, ComponentIntrospectionService::class.java)

        // go

        return administration.fetchComponent(component)
    }

    @GetMapping("/component-services/{component}")
    @ResponseBody
    fun componentServices(@PathVariable component: String) : List<InterfaceDescriptor> {
        val administration = serviceManager.acquireAdministrativeService(component, ComponentIntrospectionService::class.java)

        // go

        return administration.listServices(component)
    }

    // SSE stuff


    @Autowired
    lateinit var emitters : Emitters

    @GetMapping("/listen/{component}", produces= [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun listenTo(@PathVariable component: String) : SseEmitter {
        return this.emitters.listenTo(component)
    }
}