package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.AbstractComponent
import com.serious.service.ChannelAddress
import com.serious.service.ComponentHealth
import com.serious.service.ComponentHost
import com.serious.portal.PortalComponent
import org.springframework.beans.factory.annotation.Autowired
//import org.springframework.boot.actuate.health.HealthEndpoint
//import org.springframework.boot.actuate.health.Status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@ComponentHost(health = "/api/portal-component/portal-health")
@RestController
@RequestMapping(value = ["/api/portal-component"])
class PortalComponentImpl : AbstractComponent(), PortalComponent {
    // instance data

    //@Autowired
    //lateinit var healthEndpoint: HealthEndpoint

    // override

    @get:ResponseBody
    @get:GetMapping("/portal-health")
    override val health: ComponentHealth
        // override AbstractComponent
        get() = ComponentHealth.UP//if (healthEndpoint.health().status === Status.UP) ComponentHealth.UP else ComponentHealth.DOWN

    @get:ResponseBody
    @get:GetMapping("/uri")
    override val addresses: List<ChannelAddress>
        // implement TestComponent
        get() = java.util.List.of(
            ChannelAddress("dispatch", URI.create("http://$host:$port")),
            ChannelAddress("rest", URI.create("http://$host:$port"))
        )
}
