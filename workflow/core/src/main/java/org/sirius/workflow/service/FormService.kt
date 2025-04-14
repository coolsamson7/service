package org.sirius.workflow.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.workflow.model.Form
import org.springframework.web.bind.annotation.*

//@ServiceInterface
@RequestMapping("form/")
@RestController
interface FormService /*: Service*/ {
    @PostMapping("create")
    @ResponseBody
    fun create(@RequestBody form: Form) : Form

    @GetMapping("read/{id}/{deployment}/{name}")
    @ResponseBody
    fun read(@PathVariable id: String, @PathVariable deployment: Long, @PathVariable name: String) : Form

    @GetMapping("find-4-process/{id}/{name}")
    @ResponseBody
    fun find4Process(@PathVariable id: String, @PathVariable name: String) : Form

    @PostMapping("update")
    @ResponseBody
    fun update(@RequestBody form: Form) : Form

    @GetMapping("delete/{id}/{deployment}/{name}")
    @ResponseBody
    fun delete(@PathVariable id: String, @PathVariable deployment: Long, @PathVariable name: String)
}
