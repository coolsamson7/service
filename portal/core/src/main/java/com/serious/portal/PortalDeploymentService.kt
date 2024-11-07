package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import com.serious.portal.model.Deployment
import org.springframework.web.bind.annotation.*
import javax.print.attribute.IntegerSyntax

class DeploymentRequest(
    val application: String,
    val version : String,
    val session: Boolean,
    val host: String,
    val port: String,
    val protocol: String
)

@ServiceInterface
@RequestMapping("portal-administration/")
@RestController
interface PortalDeploymentService : Service {
    @PostMapping("compute-deployment")
    fun computeDeployment(@RequestBody request: DeploymentRequest) : Deployment
}
