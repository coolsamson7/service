package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.MicrofrontendInstance
import com.serious.portal.persistence.MicrofrontendEntityManager
import jakarta.annotation.PostConstruct
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
            //println("loaded " + instance.remoteEntry + ", healthCheck: " + instance.healthCheck)
            // add to list anyway

            this.instances.add(instance)

            try {
                manifestLoader.load(URL(instance.uri))

                instance.health  = "alive"

                this.entityManager.updateHealth(instance.uri, "alive")
            }
            catch(exception : Throwable) {
                println("och...dead")
                instance.health  = "dead"

                this.entityManager.updateHealth(instance.uri, "dead")
            }
        } // for
    }

    fun register(microfrontendInstance: MicrofrontendInstance) {
        this.instances.add(microfrontendInstance)
    }

    fun remove(url: String) {
        instances.removeIf { instance -> instance.uri == url}
    }

    @Scheduled(fixedRate = 1000 * 10)
    fun checkHealth() {
        println("check health")
        for (instance in instances) {
            try {
                println("try load " + instance.manifest.healthCheck)

                manifestLoader.load(URL(instance.manifest.healthCheck))

                if ( instance.health != "alive") {
                    //println(manifest.name + "-> alive ")
                    instance.health = "alive"

                    this.entityManager.updateHealth(instance.uri, "alive")
                }
            }
            catch(exception: Throwable) {
                println("caught " + exception.message)
                exception.printStackTrace()

                if ( instance.health == "alive") {
                    //println(instance.name + "-> dead ")
                    instance.health = "dead"

                    this.entityManager.updateHealth(instance.uri, "dead")
                }
            }
        }
    }

    fun refresh() {
        for (instance in instances) {
            try {
                val newManifest = manifestLoader.load(URL(instance.manifest.healthCheck))

                newManifest.remoteEntry = instance.uri
                newManifest.health = instance.health
                newManifest.enabled = instance.enabled

                instance.manifest = newManifest

                this.entityManager.saveMicrofrontendInstance(instance)
            }
            catch(exception: Throwable) {
                println(exception.message) // TODO
            }
        }
    }
}
