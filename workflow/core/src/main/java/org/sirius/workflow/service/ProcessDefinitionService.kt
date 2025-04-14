package org.sirius.workflow.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.web.bind.annotation.*

/*data class PropertyDescriptor(val name: String, val type: String, var value: Any?)

data class SchemaDescriptor(val properties: List<PropertyDescriptor>)
*/
data class TaskSchema(val process: SchemaDescriptor, val input: SchemaDescriptor, val output: SchemaDescriptor)

//@ServiceInterface
@CrossOrigin(
    origins = [ "http://localhost:8080", "http://localhost:4200"],
    methods = [
        RequestMethod.OPTIONS,
        RequestMethod.GET,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.POST
    ])
@RequestMapping("process-definition/")
@RestController
interface ProcessDefinitionService /*: Service*/ {
    @GetMapping("process-schema/{process}/{deployment}")
    @ResponseBody
    fun processSchema(@PathVariable process: String,  @PathVariable deployment: Long) : SchemaDescriptor

    @GetMapping("task-schema/{process}/{deployment}/{task}")
    @ResponseBody
    fun taskSchema(@PathVariable process: String,  @PathVariable deployment: Long, @PathVariable task: String) : TaskSchema

    @GetMapping("task-input/{process}/{deployment}/{task}")
    @ResponseBody
    fun taskInputSchema(@PathVariable process: String,  @PathVariable deployment: Long, @PathVariable task: String) : SchemaDescriptor
}
