package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import com.serious.portal.model.Deployment
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping


@ServiceInterface
@RequestMapping("portal-administration/")
interface PortalDeploymentService : Service {
    @GetMapping("deployment")
    fun getDeployment() : Deployment
}
