package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.DeploymentManager
import com.serious.portal.PortalDeploymentService
import com.serious.portal.model.Deployment
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.net.URL

@Component
@RestController
class PortalDeploymentServiceImpl : PortalDeploymentService {
    // instance data

    @Autowired
    lateinit var deploymentManager: DeploymentManager

    // implement

    override fun getDeployment(session: Boolean) : Deployment {
        return deploymentManager.create(session)
    }

    override fun computeDeployment(application: String, version : String, session: Boolean) : Deployment {
        return deploymentManager.create(application, version, session)
    }
}
