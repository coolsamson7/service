package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.Manifest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.net.URL

@Component
class ManifestManager {
    // instance data

    val manifests = mutableListOf<Manifest>()
    @Autowired
    lateinit var loader : ManifestLoader

    // public

    fun load(url: URL) : Manifest {
        val manifest = loader.load(url)

        manifest.remoteEntry = url.toString()
        return register(manifest)
    }

    fun register(manifest: Manifest) : Manifest {
        this.manifests.add(manifest)

        return manifest
    }
}
