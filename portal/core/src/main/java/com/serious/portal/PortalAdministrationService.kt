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

    @GetMapping("delete-stage/{stage}")
    fun deleteStage(@PathVariable stage: String)

    @GetMapping("read-stages")
    @ResponseBody
    fun readStages() : List<String>

    // application

    @PostMapping("create-application")
    @ResponseBody
    fun createApplication(@RequestBody application: Application) : Application

    @GetMapping("read-application/{application}")
    @ResponseBody
    fun readApplication(@PathVariable application: String) : Optional<Application>

    @PostMapping("update-application")
    fun updateApplication(@RequestBody application: Application) : Application

    @GetMapping("delete-application/{application}")
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

    @GetMapping("delete-application-version/{application}/{version}")
    fun deleteApplicationVersion(@PathVariable application: String, @PathVariable version: String)

    // microfrontend

    @GetMapping("read-microfrontends")
    @ResponseBody
    fun readMicrofrontends() : List<Microfrontend>

    @GetMapping("read-microfrontend/{microfrontend}")
    @ResponseBody
    fun readMicrofrontend(@PathVariable microfrontend: String) : Microfrontend

    @PostMapping("update-microfrontend")
    @ResponseBody
    fun updateMicrofrontend(@RequestBody version: Microfrontend) : Microfrontend

    @GetMapping("delete-microfrontend/{microfrontend}/{force}")
    fun deleteMicrofrontend(@PathVariable microfrontend: String, @PathVariable force: Boolean) : Boolean

    // microfrontend version

    @GetMapping("read-microfrontend-versions")
    @ResponseBody
    fun readMicrofrontendVersions() : List<MicrofrontendVersion>

    @GetMapping("read-microfrontend-version")
    @ResponseBody
    fun readMicrofrontendVersion(microfrontend: String, version: String) : MicrofrontendVersion

    @PostMapping("update-microfrontend-version")
    @ResponseBody
    fun updateMicrofrontendVersion(@RequestBody version: MicrofrontendVersion) : MicrofrontendVersion

    @GetMapping("delete-microfrontend-version/{microfrontend}/{version}")
    fun deleteMicrofrontendVersion(@PathVariable microfrontend: String, @PathVariable version: String)

    // microfrontend instance

    @PostMapping("update-microfrontend-instance")
    @ResponseBody
    fun updateMicrofrontendInstance(@RequestBody instance: MicrofrontendInstance) : MicrofrontendInstance

    @PostMapping("register-microfrontend-instance")
    @ResponseBody
    fun registerMicrofrontendInstance(@RequestBody manifest: Manifest) : MicrofrontendRegistryResult

    @GetMapping("delete-microfrontend-instance/{microfrontend}/{version}/{instance}")
    fun deleteMicrofrontendInstance(@PathVariable microfrontend: String, @PathVariable version: String, @PathVariable instance: String)
}
