package com.serious.service.channel.dispatch
/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseBody

 /**
 * This rest service is required to dispatch and execute a [ServiceRequest]
 */
@ServiceInterface
interface DispatchService : Service {
    @PostMapping("/dispatch")
    @ResponseBody
    fun dispatch(@RequestBody request: String): String
}
