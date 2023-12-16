package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.ManifestLoader
import com.serious.portal.ManifestManager
import com.serious.portal.PortalAdministrationService
import com.serious.portal.model.Address
import com.serious.portal.model.Manifest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController
import java.net.URL

@Component
@RestController
class PortalAdministrationServiceImpl : PortalAdministrationService {
    @Autowired
    lateinit var manifestManager: ManifestManager
    @Autowired
    lateinit var manifestLoader: ManifestLoader

    // implement PortalAdministrationService
    override fun registerMicrofrontend(address: Address): Manifest? {
        val url = URL(address.protocol + "//" + address.host + ":" + address.port).toString()
        val result: Manifest? = manifestManager.manifests.find { manifest -> manifest.remoteEntry == url }
        // check for duplicates

        if (result != null)
            return result
        else {
            try {
                return manifestManager.register(manifestLoader.load(URL(url)))
            }
            catch (exception: Exception) {
                return null
            }
        }
    }

    override fun removeMicrofrontend(address: Address) {
        val url = URL(address.protocol + "//" + address.host + ":" + address.port).toString()

        manifestManager.remove(url)
    }

    override fun saveManifest(manifest: Manifest): String {
        manifestManager.save(manifest)

        return "ok"
    }
}
