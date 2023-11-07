package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ServiceInstanceRegistry
import com.serious.service.TopologyListener
import com.serious.service.administration.model.UpdateDTO
import jakarta.annotation.PostConstruct
import lombok.extern.slf4j.Slf4j
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

@Component
@Slf4j
class EmitterManager : TopologyListener {
    // instance data

    var logger : Logger = LoggerFactory.getLogger(EmitterManager::class.java)
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
        logger.info("update");

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
        logger.debug("send event")

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
                logger.debug("caught exception " + e.message)

                emitter.completeWithError(e)
                failedEmitters.add(emitter)
            }

        emitters.removeAll(failedEmitters)
    }

    fun listenTo(component: String): SseEmitter { // TODO: real subscription...
        val emitter = SseEmitter(3_600_000L); // 1h

        emitter.onCompletion {
            logger.info("emitter.onCompletion")
            emitters.remove(emitter)
        }

        emitter.onTimeout {
            logger.info("emitter.onTimeout")

            emitter.complete() // will trigger the second callback
        }

        this.emitters.add(emitter)

        return emitter
    }
}
