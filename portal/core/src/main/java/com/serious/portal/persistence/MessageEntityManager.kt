package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.Message
import com.serious.portal.MessageChanges
import com.serious.portal.persistence.entity.MessageEntity
import com.serious.portal.translations.Translation
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import jakarta.persistence.Tuple

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class MessageEntityManager() {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var repository: MessageRepository

    // private

    private fun toEntity(message: Message) : MessageEntity {
        val entity = MessageEntity()

        entity.name = message.name
        entity.namespace = message.namespace
        entity.locale = message.locale
        entity.value = message.value

        return entity
    }

    private fun toMessage(entity: MessageEntity) : Message {
        return Message(
            entity.id,
            entity.namespace,
            entity.name,
            entity.locale,
            entity.value
        )
    }

    // public

    fun createMessage(message: Message) {
        this.entityManager.persist(toEntity(message))
    }

    fun updateMessage(message: Message) {
        this.repository.save(toEntity(message))
    }

    fun deleteMessage(id: Long) {
        this.repository.deleteById(id)
    }

    fun readNamespaces() :List<String> {
        return this.entityManager.createQuery("select distinct namespace from MessageEntity", String::class.java)
            .resultList
    }

    fun readLocales() :List<String> {
        return this.entityManager.createQuery("select locale from LanguageEntity ", String::class.java)
            .resultList
    }

    fun saveChanges(changes: MessageChanges) {
        // new

        for ( newMessage in changes.newMessages) {
            this.entityManager.persist(toEntity(newMessage))
        }

        // changed

        for ( changedMessage in changes.changedMessages) {
            this.repository.save(toEntity(changedMessage))
        }
    }

    fun readMessages(namespace: String, locale: String) :List<Message> {
        return this.entityManager.createQuery("select m from MessageEntity m where m.namespace = :namespace and m.locale =:locale", MessageEntity::class.java)
            .setParameter("namespace", namespace)
            .setParameter("locale", locale)
            .resultList.map { entity -> toMessage(entity) }
    }

    fun readAllMessages(namespace: String) :List<Message> {
        return this.entityManager.createQuery("select m from MessageEntity m where m.namespace = :namespace", MessageEntity::class.java)
            .setParameter("namespace", namespace)
            .resultList.map { entity -> toMessage(entity) }
    }

    fun readTranslations(namespace: String, locale: String) :List<Translation> {
        return this.entityManager.createQuery("select name, value from MessageEntity where namespace = :namespace and locale =:locale", Tuple::class.java)
            .setParameter("namespace", namespace)
            .setParameter("locale", locale)
            .resultList.map { item ->
                Translation(item[0] as String, item[1] as String)
            }
    }
}
