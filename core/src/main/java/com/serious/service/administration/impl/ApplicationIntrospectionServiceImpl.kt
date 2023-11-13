package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ChannelManager
import com.serious.service.administration.ApplicationIntrospectionService
import com.serious.service.administration.model.ChannelDTO
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class ApplicationIntrospectionServiceImpl : ApplicationIntrospectionService {
    @Autowired
    lateinit var channelManager: ChannelManager

    // implement

    override fun channels() : Map<String,ChannelDTO> {
        val result = HashMap<String,ChannelDTO>()
        channelManager.channels.forEach { entry ->
            val index = entry.key.lastIndexOf(":")
            val component = entry.key.substring(0, index)

            result.put(component, ChannelDTO(entry.value.name, entry.value.address.uri))
        }

        return result
    }
}