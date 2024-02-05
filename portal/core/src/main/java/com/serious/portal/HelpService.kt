package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*

@ServiceInterface
@RequestMapping("help/")
@RestController
interface HelpService : Service {
    @GetMapping("get-help/{feature}")
    fun getHelp(@PathVariable feature : String) : String
}
