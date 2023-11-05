package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ServiceInstanceRegistry
import com.serious.service.administration.model.UpdateDTO
import jakarta.annotation.PostConstruct
import lombok.extern.slf4j.Slf4j
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

@Component
@Slf4j
class EmitterManager : TopologyListener {
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
        //log.info("update");

        val deletedInstances: HashMap<String, List<String>> = HashMap()
        for (entry in update.getDeletedInstances())
            deletedInstances.put(entry.key, entry.value.map { serviceInstance -> serviceInstance.instanceId })

        send(UpdateDTO(
            update.getDeletedServices(),
            update.getAddedServices(),
            deletedInstances,
            update.getAddedInstances()
        ))
    }

    fun send(data: Any) {
        println("send")

        val failedEmitters: MutableList<SseEmitter> = ArrayList()

        for ( emitter in this.emitters)
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("update")
                        .id("id") // ??
                        .data(data, MediaType.APPLICATION_JSON)
                )
            }
            catch (e: Exception) {
                println("emitter caught exception" + e.message)

                emitter.completeWithError(e)
                failedEmitters.add(emitter)
            }

        emitters.removeAll(failedEmitters)
    }

    fun listenTo(component: String): SseEmitter { // TODO
        val emitter = SseEmitter(3_600_000L); // 1h

        emitter.onCompletion {
            println("emitter.onCompletion")
            emitters.remove(emitter)
        }

        emitter.onTimeout {
            println("emitter.onTimeout")
            emitter.complete() // will trigger the second callback
        }

        this.emitters.add(emitter)

        return emitter
    }
}
