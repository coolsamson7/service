package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.AbstractComponent
import com.serious.service.ChannelAddress
import com.serious.service.ComponentHealth
import com.serious.service.ComponentHost
import com.serious.service.administration.AdministrationComponent
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@ComponentHost(health = "/administration/health")
@RestController
@RequestMapping(value = ["/administration"])
internal class AdministrationComponentImpl : AbstractComponent(), AdministrationComponent {
    @get:ResponseBody
    @get:GetMapping("/health")
    override val health: ComponentHealth
        get() = ComponentHealth.UP

    @get:ResponseBody
    @get:GetMapping("/uri")
    override val addresses: List<ChannelAddress>
        get() = listOf(ChannelAddress("rest", URI.create("http://localhost:$port")))
}