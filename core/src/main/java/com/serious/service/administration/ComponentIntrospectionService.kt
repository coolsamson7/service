package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import com.serious.service.administration.model.ComponentDTO
import com.serious.service.administration.model.ServiceDTO
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody

@ServiceInterface
@RequestMapping("component-administration/")
interface ComponentIntrospectionService : Service {
    @GetMapping("component/{component}")
    @ResponseBody
    fun fetchComponent(@RequestParam component: String) : ComponentDTO

    @GetMapping("component-services/{component}")
    @ResponseBody
    fun listServices(@RequestParam component: String) : List<ServiceDTO>
}