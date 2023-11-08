package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.AbstractComponent
import com.serious.service.ChannelAddress
import com.serious.service.ComponentHost
import com.serious.service.administration.AdministrationComponent
import java.net.URI

@ComponentHost
internal class AdministrationComponentImpl : AbstractComponent(), AdministrationComponent {
    override val addresses: List<ChannelAddress>
        get() = listOf(ChannelAddress("rest", URI.create("http://localhost:$port")))
}