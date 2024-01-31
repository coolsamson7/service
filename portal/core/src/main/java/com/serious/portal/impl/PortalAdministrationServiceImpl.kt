package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.ManifestLoader
import com.serious.portal.ManifestManager
import com.serious.portal.PortalAdministrationService
import com.serious.portal.model.Address
import com.serious.portal.model.Manifest
import com.serious.portal.model.RegistryError
import com.serious.portal.model.RegistryResult
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import java.net.MalformedURLException
import java.net.URL

@Component
@RestController
class PortalAdministrationServiceImpl : PortalAdministrationService {
    @Autowired
    lateinit var manifestManager: ManifestManager
    @Autowired
    lateinit var manifestLoader: ManifestLoader

    // implement PortalAdministrationService

    override fun registerManifest(manifest: Manifest) : RegistryResult {
        var url = manifest.remoteEntry

        if ( manifest.healthCheck == null)
            manifest.healthCheck = manifest.remoteEntry

        // check for duplicates

        val result: Manifest? = manifestManager.manifests.find { manifest -> manifest.remoteEntry == url }

        if (result != null)
            return RegistryResult(RegistryError.duplicate, null, "microfrontend already registered")
        else {
            manifestManager.register(manifest)

            return RegistryResult(null, manifest, "registered")
        }
    }

    override fun registerMicrofrontend(address: Address): RegistryResult {
        var url : URL? = null

        try {
            url = URL(address.protocol + "//" + address.host + ":" + address.port)
        }
        catch(exception: MalformedURLException) {
            return RegistryResult(RegistryError.malformed_url, null, exception.message!!)
        }

        // check for duplicates

        val result: Manifest? = manifestManager.manifests.find { manifest -> manifest.remoteEntry == url.toString() }

        if (result != null)
            return RegistryResult(RegistryError.duplicate, null, "microfrontend already registered")
        else {
            var manifest : Manifest? = null
            try {
                manifest = manifestLoader.load(url)

                manifest.enabled = true
                manifest.health  = "alive"
                manifest.remoteEntry = url.toString()
            }
            catch (exception: Exception) {
                return RegistryResult(RegistryError.unreachable, null, exception.message!!)
            }

            manifestManager.register(manifest)

            return RegistryResult(null, manifest, "registered")
        }
    }

    override fun removeMicrofrontend(address: Address) {
        val url = URL(address.protocol + "//" + address.host + ":" + address.port).toString()

        manifestManager.remove(url)
    }

    override fun saveManifest(manifest: Manifest) {
        manifestManager.save(manifest)
    }

    override fun enableMicrofrontend(name : String, enabled: Boolean) {
        manifestManager.enableMicrofrontend(name, enabled)
    }

    override fun refresh() {
        manifestManager.refresh()
    }

    // TEST TODO
    override fun throwDeclaredException(): String {
        throw NullPointerException("ouch")
    }

    override fun throwException(): String {
        throw NullPointerException("ouch")
    }
}
