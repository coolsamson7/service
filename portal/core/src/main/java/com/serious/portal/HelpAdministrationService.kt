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
@RequestMapping("help-administration/")
@RestController
interface HelpAdministrationService : Service {
    @PostMapping("save-help/{feature}")
    fun saveHelp(@PathVariable feature : String, @RequestBody help : String)

    @GetMapping("read-help/{feature}")
    fun readHelp(@PathVariable feature : String) : String

    @GetMapping("delete-help/{feature}")
    fun deleteHelp(@PathVariable feature : String)

    @GetMapping("read-entries/")
    fun readEntries() : List<String>
}
