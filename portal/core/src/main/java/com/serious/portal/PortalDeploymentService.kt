package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import com.serious.portal.model.Deployment
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@ServiceInterface
@RequestMapping("portal-administration/")
@RestController
interface PortalDeploymentService : Service {
    @GetMapping("deployment/{session}")
    fun getDeployment(@PathVariable session: Boolean) : Deployment

    @GetMapping("compute-deployment/{application}/{version}/{session}")
    fun computeDeployment(@PathVariable application: String, @PathVariable version : String, @PathVariable session: Boolean) : Deployment
}
