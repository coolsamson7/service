package com.serious.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.portal.Message
import com.serious.portal.MessageAdministrationService
import com.serious.portal.MessageChanges
import com.serious.portal.persistence.MessageEntityManager
import com.serious.portal.translations.TranslationManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@Component
@RestController
class MessageAdministrationServiceServiceImpl : MessageAdministrationService {
    // instance data

    @Autowired
    lateinit var messageEntityManager: MessageEntityManager

    @Autowired
    lateinit var translationManager : TranslationManager

    // implement

    @Transactional
    override fun createMessage(message: Message) {
        messageEntityManager.createMessage(message)

        translationManager.clearCache()
    }

    @Transactional
    override fun updateMessage(message: Message) {
        messageEntityManager.updateMessage(message)

        translationManager.clearCache()
    }

    @Transactional
    override fun deleteMessage(id: Long) {
        messageEntityManager.deleteMessage(id)

        translationManager.clearCache()
    }

    @Transactional
    override fun readMessages(namespace: String, locale: String) : List<Message> {
        return messageEntityManager.readMessages(namespace, locale)
    }

    override fun readAllMessages(namespace: String) : List<Message> {
        return messageEntityManager.readAllMessages(namespace)
    }

    @Transactional
    override fun readNamespaces() : List<String> {
        return messageEntityManager.readNamespaces()
    }

    @Transactional
    override fun readLocales() : List<String> {
        return messageEntityManager.readLocales()
    }

    @Transactional
    override fun saveChanges(changes: MessageChanges) :List<Message> {
        try {
            return messageEntityManager.saveChanges(changes)
        }
        finally {
            translationManager.clearCache()
        }
    }
}
