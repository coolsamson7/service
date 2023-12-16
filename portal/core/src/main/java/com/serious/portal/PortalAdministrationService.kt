package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.*
import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*


@ServiceInterface
@RequestMapping("portal-administration/")
@RestController
interface PortalAdministrationService : Service {
    @PostMapping("register-microfrontend/")
    @ResponseBody
    fun registerMicrofrontend(@RequestBody url : Address) : Manifest?

    @PostMapping("remove-microfrontend/")
    fun removeMicrofrontend(@RequestBody url : Address)

    @PostMapping("save-manifest/")
    @ResponseBody
    fun saveManifest(@RequestBody manifest : Manifest) : String
}
