package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component
import com.serious.service.ComponentInterface
import org.springframework.web.bind.annotation.RestController

@ComponentInterface(name = "PortalComponent",
    services = [
        PortalIntrospectionService::class,
        PortalAdministrationService::class,
        PortalDeploymentService::class
    ])
@RestController
interface PortalComponent : Component {
}
