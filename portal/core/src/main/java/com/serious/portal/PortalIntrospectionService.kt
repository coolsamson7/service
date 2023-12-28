package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.Manifest
import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@ServiceInterface
@RequestMapping("portal-introspection/")
@RestController
interface PortalIntrospectionService : Service {
    @GetMapping("manifests")
    fun getManifests(): List<Manifest>
}
