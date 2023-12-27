package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*

@ServiceInterface
@RequestMapping("portal-messages/")
@RestController
interface MessageAdministrationService : Service {
    @PostMapping("create-message")
    @ResponseBody
    fun createMessage(@RequestBody() message: Message)

    @PostMapping("update-message")
    @ResponseBody
    fun updateMessage(@RequestBody() message: Message)

    @GetMapping("delete-message/{id}")
    @ResponseBody
    fun deleteMessage(@PathVariable id: Long)

    @GetMapping("read-messages/{namespace}/{locale}")
    @ResponseBody
    fun readMessages(@PathVariable namespace: String, @PathVariable locale: String) : List<Message>

    @GetMapping("read-all-messages/{namespace}")
    @ResponseBody
    fun readAllMessages(@PathVariable namespace: String) : List<Message>

    @GetMapping("read-namespaces")
    @ResponseBody
    fun readNamespaces() : List<String>

    @GetMapping("read-locales")
    @ResponseBody
    fun readLocales() : List<String>

    @PostMapping("save-changes")
    @ResponseBody
    fun saveChanges(@RequestBody() changes: MessageChanges)
}

