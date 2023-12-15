package com.serious.portal.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.ManifestManager
import com.serious.portal.PortalAdministrationService
import com.serious.portal.PortalIntrospectionService
import com.serious.portal.model.Manifest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class PortalIntrospectionServiceImpl : PortalIntrospectionService {
    @Autowired
    lateinit var manifestManager: ManifestManager

    // implement

    override fun getManifests(): List<Manifest> {
        return manifestManager.manifests
    }
}
