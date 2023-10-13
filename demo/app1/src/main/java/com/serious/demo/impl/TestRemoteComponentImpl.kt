package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.TestRemoteComponent
import com.serious.service.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.actuate.health.HealthEndpoint
import org.springframework.boot.actuate.health.Status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import java.net.URI

 /**
 * @author Andreas Ernst
 */
@ComponentHost(health = "/api/test-remote-component/test-health")
@RestController
@RequestMapping("/api/test-remote-component/")
class TestRemoteComponentImpl : AbstractComponent(), TestRemoteComponent {
    // instance data

    @Autowired
    lateinit var healthEndpoint: HealthEndpoint

    @get:ResponseBody
    @get:GetMapping("/test-health")
    override val health: ComponentHealth
        // override AbstractComponent
        get() = if (healthEndpoint.health().status === Status.UP) ComponentHealth.UP else ComponentHealth.DOWN

    @get:ResponseBody
    @get:GetMapping("/uri")
    override val addresses: List<ChannelAddress>
        get() = listOf(
            ChannelAddress("dispatch", URI.create("http://$host:$port")),
            ChannelAddress("rest", URI.create("http://$host:$port"))
        )
}
