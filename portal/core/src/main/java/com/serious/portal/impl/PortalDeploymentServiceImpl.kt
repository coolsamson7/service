package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.DeploymentManager
import com.serious.portal.PortalAdministrationService
import com.serious.portal.PortalDeploymentService
import com.serious.portal.model.Deployment
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController
import java.net.URL

@Component
@RestController
class PortalDeploymentServiceImpl : PortalDeploymentService {
    // instance data

    @Autowired
    lateinit var deploymentManager: DeploymentManager

    @PostConstruct
    fun onInit() {
        // TODO
        deploymentManager.manager.load(URL("http://localhost:4201"))
        deploymentManager.manager.load(URL("http://localhost:4202"))
    }

    // implement

    override fun getDeployment() : Deployment {
        return deploymentManager.create()
    }
}
