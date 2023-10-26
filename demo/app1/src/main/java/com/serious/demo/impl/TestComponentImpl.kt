package com.serious.demo.impl

import com.serious.demo.TestComponent
import com.serious.service.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.actuate.health.HealthEndpoint
import org.springframework.boot.actuate.health.Status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import java.net.URI

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@ComponentHost(health = "/api/test-component/test-health")
@RestController
@RequestMapping(value = ["/api/test-component"])
class TestComponentImpl : AbstractComponent(), TestComponent {
    // instance data

    @Autowired
    lateinit var healthEndpoint: HealthEndpoint

    @get:ResponseBody
    @get:GetMapping("/test-health")
    override val health: ComponentHealth
        // override AbstractComponent
        get() = if (healthEndpoint.health().status === Status.UP) ComponentHealth.UP else ComponentHealth.DOWN

    // implement TestComponent

    override fun hello(): String {
        return "hello"
    }

    @get:ResponseBody
    @get:GetMapping("/uri")
    override val addresses: List<ChannelAddress>
        get() = java.util.List.of(
            ChannelAddress("dispatch", URI.create("http://$host:$port")),
            ChannelAddress("rest", URI.create("http://$host:$port"))
        )
}