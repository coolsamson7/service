package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.Manifest
import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*


@ServiceInterface
@RequestMapping("portal-administration/")
@RestController
interface PortalAdministrationService : Service {
    @PostMapping("add-manifest/")
    fun addManifest(@RequestBody() url : String) : Manifest?

    @PostMapping("remove-manifest/")
    fun removeManifest(@RequestBody() url : String)

    @PostMapping("save-manifest/")
    fun saveManifest(@RequestBody manifest : Manifest) : String
}
