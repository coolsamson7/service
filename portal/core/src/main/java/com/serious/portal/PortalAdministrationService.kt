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
import java.util.*


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

    // new

    // stage

    @PostMapping("create-stage")
    fun createStage(@RequestBody  stage: String)

    @DeleteMapping("delete-stage/{stage}")
    fun deleteStage(@PathVariable stage: String)

    @GetMapping("read-stages")
    @ResponseBody
    fun readStages() : List<String>

    // application

    @PostMapping("create-application")
    @ResponseBody
    fun createApplication(@RequestBody application: Application)

    @GetMapping("read-application/{application}")
    @ResponseBody
    fun readApplication(@PathVariable application: String) : Optional<Application>

    @PostMapping("update-application")
    fun updateApplication(@RequestBody application: Application)

    @DeleteMapping("delete-application/{application}")
    fun deleteApplication(@PathVariable application: String)

    @GetMapping("read-applications")
    @ResponseBody
    fun readApplications() : List<Application>

    // application-version

    @PostMapping("create-application-version/{application}")
    @ResponseBody
    fun createApplicationVersion(@PathVariable application: String, @RequestBody applicationVersion: ApplicationVersion) : ApplicationVersion

    @PostMapping("update-application-version")
    fun updateApplicationVersion(@RequestBody application: ApplicationVersion) : ApplicationVersion

    @DeleteMapping("delete-application-version/{application}/{version}")
    fun deleteApplicationVersion(@PathVariable application: String, @PathVariable version: Long)

    // microfrontend version

    @GetMapping("read-microfrontend-versions")
    @ResponseBody
    fun readMicrofrontendVersions() : List<MicrofrontendVersion>

    @PostMapping("update-microfrontend-version")
    @ResponseBody
    fun updateMicrofrontendVersion(@RequestBody version: MicrofrontendVersion) : MicrofrontendVersion

    // microfrontend instance

    @PostMapping("update-microfrontend-instance")
    @ResponseBody
    fun updateMicrofrontendInstance(@RequestBody instance: MicrofrontendInstance) : MicrofrontendInstance
}
