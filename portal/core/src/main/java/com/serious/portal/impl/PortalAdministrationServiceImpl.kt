package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.ManifestLoader
import com.serious.portal.ManifestManager
import com.serious.portal.PortalAdministrationService
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
    override fun addManifest(url: String): Manifest? {
        try {
            return manifestManager.register(manifestLoader.load(URL(url)))
        }
        catch (exception: Exception) {
            return null
        }

        return null
    }

    override fun removeManifest(url: String) {
        manifestManager.remove(url)
    }

    override fun saveManifest(manifest: Manifest): String {
        manifestManager.save(manifest)

        return "ok"
    }
}
