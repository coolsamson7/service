package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.*
import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*
import java.lang.NullPointerException


@ServiceInterface
@RequestMapping("portal-administration/")
@RestController
interface PortalAdministrationService : Service {
    @PostMapping("register-microfrontend")
    @ResponseBody
    fun registerMicrofrontend(@RequestBody url : Address) : RegistryResult

    @PostMapping("register-manifest")
    @ResponseBody
    fun registerManifest(@RequestBody manifest: Manifest) : RegistryResult


    @PostMapping("remove-microfrontend")
    fun removeMicrofrontend(@RequestBody url : Address)

    @PostMapping("save-manifest")
    @ResponseBody
    fun saveManifest(@RequestBody manifest : Manifest)

    @GetMapping("enable-microfrontend/{name}/{enabled}")
    fun enableMicrofrontend(@PathVariable name : String, @PathVariable enabled: Boolean)

    @GetMapping("refresh")
    fun refresh()

    // TEST TODO
    @RequestMapping(path = ["throwDeclared"], method = [RequestMethod.GET])
    @ResponseBody
    @Throws(NullPointerException::class)
    fun throwDeclaredException(): String

    @RequestMapping(path = ["throw"], method = [RequestMethod.GET])
    @ResponseBody
    fun throwException(): String
}
