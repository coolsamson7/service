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
import org.springframework.web.bind.annotation.*

@ServiceInterface
@RequestMapping("component-administration/")
@RestController
interface ComponentIntrospectionService : Service {
    @GetMapping("component/{component}")
    @ResponseBody
    fun fetchComponent(@PathVariable("component") component: String) : ComponentDTO

    @GetMapping("component-service/{component}")
    @ResponseBody
    fun fetchComponentServices(@PathVariable component: String) : List<String>

    @GetMapping("component-services/{component}")
    @ResponseBody
    fun listServices(@PathVariable component: String) : Collection<InterfaceDescriptor>

    @PostMapping("execute-method/{component}")
    @ResponseBody
    fun executeMethod(@PathVariable component: String, @RequestBody request: String) : String
}