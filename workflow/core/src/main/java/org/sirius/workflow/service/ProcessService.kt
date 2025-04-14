package org.sirius.workflow.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.web.bind.annotation.*

import org.sirius.workflow.model.*

@CrossOrigin(
    origins = [ "http://localhost:8080", "http://localhost:4200"],
    methods = [
        RequestMethod.OPTIONS,
        RequestMethod.GET,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.POST
    ])
@RequestMapping("process/")
@RestController
interface ProcessService /*: Service*/ {
    @PostMapping("create/{name}")
    @ResponseBody
    fun create(@PathVariable name: String, @RequestBody xml: String) : Process

    @PostMapping("update")
    @ResponseBody
    fun update(@RequestBody process: Process) : Process

    @GetMapping("read/{id}/{deployment}")
    @ResponseBody
    fun read(@PathVariable id: String, @PathVariable deployment: Long) : Process

    @GetMapping("read-all")
    @ResponseBody
    fun readAll() : List<Process>

    @GetMapping("publish/{id}/{deployment}/{bpmn}")
    @ResponseBody
    fun publish(@PathVariable id: String, @PathVariable deployment: Long, @PathVariable bpmn: String) : Process

    @GetMapping("delete/{id}/{deployment}")
    @ResponseBody
    fun delete(@PathVariable id: String, @PathVariable deployment: Long)
}
