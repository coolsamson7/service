package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.Manifest
import com.serious.portal.persistence.ManifestEntityManager
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.net.URL


@Component
class ManifestManager {
    // instance data

    val manifests = mutableListOf<Manifest>()
    @Autowired
    lateinit var loader : ManifestLoader
    @Autowired
    lateinit var entityManager : ManifestEntityManager

    // lifecycle

    @PostConstruct
    fun loadDatabase() {
        for ( manifest in entityManager.readAll()) {
            try {
                // try to load

                val activeManifest = loader.load(URL(manifest.remoteEntry))

                activeManifest.enabled = manifest.enabled
                activeManifest.health  = "alive"

                this.entityManager.saveManifest(activeManifest)

                this.manifests.add(activeManifest)
            }
            catch(exception : Throwable) {
                println(exception.message)
            }
        }
    }

    // public

    fun load(url: URL) : Manifest {
        val manifest = loader.load(url)

        manifest.enabled = true
        manifest.health = "alive"
        manifest.remoteEntry = url.toString()

        return register(manifest)
    }

    fun register(manifest: Manifest) : Manifest {
        this.manifests.add(manifest)

        entityManager.createManifest(manifest)

        return manifest
    }

    fun remove(url: String) {
        manifests.removeIf { manifest -> manifest.remoteEntry == url}

        entityManager.deleteManifestById(url)
    }

    fun save(manifest: Manifest) {
        val index = manifests.indexOfFirst { man -> man.remoteEntry == manifest.remoteEntry }

        if ( index >= 0) {
            manifests[index] = manifest
        }
        else {
            manifests.add(manifest)
        }

        this.entityManager.saveManifest(manifest)
    }

    @Scheduled(fixedRate = 1000 * 10)
    fun checkHealth() {
        for (manifest in manifests) {
            try {
                loader.load(URL(manifest.remoteEntry))

                if ( manifest.health != "alive") {
                    println(manifest.name + "-> alive ")
                    manifest.health = "alive"

                    this.entityManager.updateHealth(manifest.remoteEntry!!, "alive")
                }
            }
            catch(exception: Throwable) {
                if ( manifest.health == "alive") {
                    println(manifest.name + "-> dead ")
                    manifest.health = "dead"

                    this.entityManager.updateHealth(manifest.remoteEntry!!, "dead")
                }
            }
        }
    }

    fun refresh() {
        var index = 0
        for (manifest in manifests) {
            try {
                val newManifest = loader.load(URL(manifest.remoteEntry))

                newManifest.remoteEntry = manifest.remoteEntry
                newManifest.health = manifest.health
                newManifest.enabled = manifest.enabled

                manifests[index] = newManifest

                this.entityManager.saveManifest(newManifest)
            }
            catch(exception: Throwable) {
                println(exception.message) // TODO
            }

            index++
        }
    }

    fun enableMicrofrontend(name : String, enabled: Boolean) {
        val manifest = this.manifests.find { manifest -> manifest.name == name }

        manifest?.enabled = enabled

        this.entityManager.updateEnabled(manifest!!.remoteEntry!!, enabled)
    }
}
