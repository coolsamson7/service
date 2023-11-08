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

data class EmitterInfo (
    val subscriber : String,
    var component : String,
    val emitter: SseEmitter
)
@Component
@Slf4j
class EmitterManager : TopologyListener {
    // instance data

    var logger : Logger = LoggerFactory.getLogger(EmitterManager::class.java)
    var emitters: ArrayList<EmitterInfo> = ArrayList()

    @Autowired
    lateinit var serviceInstanceRegistry: ServiceInstanceRegistry

    // constructor

    @PostConstruct
    fun init() {
        this.serviceInstanceRegistry.addListener(this)
    }

    // private

    private fun find(subscriber: String) :EmitterInfo? {
        return emitters.find { info -> info.subscriber == subscriber }
    }

    private fun send(update: UpdateDTO) {
        logger.debug("send event")

        val failedEmitters: MutableList<EmitterInfo> = ArrayList()

        for ( info in this.emitters) {
            val emitter = info.emitter

            var interested = !update.addedServices.isEmpty() || !update.deletedServices.isEmpty()

            if ( !interested ) {
                if ( info.component.isEmpty())
                    interested = !update.deletedInstances.isEmpty() || !update.addedInstances.isEmpty()
                else
                    interested = update.deletedInstances.containsKey(info.component) || update.addedInstances.containsKey(info.component)
            }

            if ( interested )
                try {
                    emitter.send(
                        SseEmitter.event()
                            .name("update")
                            .id("id") // ??
                            .data(update, MediaType.APPLICATION_JSON)
                    )
                }
                catch (e: Exception) {
                    logger.debug("caught exception " + e.message)

                    emitter.completeWithError(e)
                    failedEmitters.add(info)
                }
        } // for

        emitters.removeAll(failedEmitters)
    }

    // public
    public fun listenTo(subscriber: String, component: String) {
        this.find(subscriber)?.component = component
    }
    public fun connect(subscriber: String): SseEmitter {
        val emitter = SseEmitter(3_600_000L); // 1h

        val info = EmitterInfo(subscriber, "", emitter)

        // on completion

        emitter.onCompletion {
            logger.info("emitter.onCompletion")
            emitters.remove(info)
        }

        // timeout

        emitter.onTimeout {
            logger.info("emitter.onTimeout")

            emitter.complete() // will trigger the second callback
        }

        this.emitters.add(info)

        // acknowledge

        try {
            emitter.send(
                SseEmitter.event()
                    .name("connect")
                    .id("id") // ??
                    .data("ok")
            )
        }
        catch(e: Exception) {}

        // done

        return emitter
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
}
