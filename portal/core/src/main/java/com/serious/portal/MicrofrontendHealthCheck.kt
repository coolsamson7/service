package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.MicrofrontendInstance
import com.serious.portal.persistence.MicrofrontendEntityManager
import jakarta.annotation.PostConstruct
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.sirius.events.AbstractEventListener
import org.sirius.events.Event
import org.sirius.events.EventListener
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.net.URL

@Component
class MicrofrontendHealthCheck {
    // instance data

    val instances = mutableListOf<MicrofrontendInstance>()
    @Autowired
    lateinit var manifestLoader : ManifestLoader
    @Autowired
    lateinit var entityManager : MicrofrontendEntityManager

    // lifecycle

    @PostConstruct
    fun loadDatabase() {
        for ( instance in entityManager.readAll()) {
            this.register(instance)

            // initial check

            this.entityManager.updateHealth(instance.uri, if ( check(instance) )"alive" else "dead")
        } // for
    }

    fun register(microfrontendInstance: MicrofrontendInstance) {
        if ( Tracer.ENABLED)
            Tracer.trace("com.serious.portal", TraceLevel.HIGH, "register microfrontend ${microfrontendInstance.uri}")

        this.instances.add(microfrontendInstance)
    }

    fun check(microfrontendInstance: MicrofrontendInstance) : Boolean {
        if ( Tracer.ENABLED)
            Tracer.trace("com.serious.portal", TraceLevel.HIGH, "check microfrontend ${microfrontendInstance.uri}")

        return try {
            manifestLoader.load(URL(microfrontendInstance.uri))
            true
        }
        catch(exception : Throwable) {
            if ( Tracer.ENABLED)
                Tracer.trace("com.serious.portal", TraceLevel.HIGH, "caught ${exception.message}")

            false
        }
    }

    fun remove(url: String) {
        if ( Tracer.ENABLED)
            Tracer.trace("com.serious.portal", TraceLevel.HIGH, "deregister microfrontend ${url}")

        instances.removeIf { instance -> instance.uri == url}
    }

    @Scheduled(fixedRate = 1000 * 10)
    fun checkHealth() {
        if ( Tracer.ENABLED)
            Tracer.trace("com.serious.portal", TraceLevel.HIGH, "check health")

        for (instance in instances) {
            if (check(instance)) {
                if ( instance.health != "alive") {
                    if ( Tracer.ENABLED)
                        Tracer.trace("com.serious.portal", TraceLevel.HIGH, "${instance.uri} is alive again")

                    instance.health = "alive"

                    this.entityManager.updateHealth(instance.uri, "alive")
                }
            }
            else {
                if ( instance.health == "alive") {
                    if ( Tracer.ENABLED)
                        Tracer.trace("com.serious.portal", TraceLevel.HIGH, "${instance.uri} is dead")

                    instance.health = "dead"

                    this.entityManager.updateHealth(instance.uri, "dead")
                }
            }
        }
    }
}
