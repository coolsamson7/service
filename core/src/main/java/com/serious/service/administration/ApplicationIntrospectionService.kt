package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import com.serious.service.administration.model.ChannelDTO
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody

@ServiceInterface
@RequestMapping("application-administration/")
interface ApplicationIntrospectionService : Service {
    @GetMapping("channels")
    @ResponseBody
    fun channels() : Map<String, ChannelDTO>
}