package com.serious.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.PortalIntrospectionService
import com.serious.portal.model.Manifest
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class PortalIntrospectionServiceImpl : PortalIntrospectionService {

    // implement

    override fun getManifests(): List<Manifest> {
        throw Error("WTF")
    }
}
