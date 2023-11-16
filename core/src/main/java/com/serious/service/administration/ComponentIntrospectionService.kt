package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.InterfaceDescriptor
import com.serious.service.Service
import com.serious.service.ServiceInterface
import com.serious.service.administration.model.ComponentDTO
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@ServiceInterface
@RequestMapping("component-administration/")
@RestController
interface ComponentIntrospectionService : Service {
    @GetMapping("component/{component}")
    @ResponseBody
    fun fetchComponent(@PathVariable component: String) : ComponentDTO

    @GetMapping("component-service/{component}")
    @ResponseBody
    fun fetchComponentServices(@PathVariable component: String) : List<String>

    @GetMapping("component-services/{component}")
    @ResponseBody
    fun listServices(@PathVariable component: String) : Collection<InterfaceDescriptor>
}