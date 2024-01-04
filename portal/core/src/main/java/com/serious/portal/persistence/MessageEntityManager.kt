package com.serious.portal.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
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

        entity.id = message.id
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

    fun saveChanges(changes: MessageChanges) :List<Message> {
        // new

        val newMessages = changes.newMessages.map { m -> toEntity(m) }
        for ( newMessage in newMessages) {
            this.entityManager.persist(newMessage)
        }

        // changed

        for ( changedMessage in changes.changedMessages) {
            this.repository.save(toEntity(changedMessage))
        }

        // deleted

        for ( deletedMessage in changes.deletedMessages) {
            this.repository.deleteById(deletedMessage.id)
        }

        // make sure the new ids are generated

        this.entityManager.flush()

        // return the messages including th ecreated ids

        return newMessages.map { entity -> toMessage(entity) }
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

    fun readDistinctNames(namespace: String) : List<String> {
        return this.entityManager.createQuery("select distinct name from MessageEntity where namespace = :namespace", Tuple::class.java)
            .setParameter("namespace", namespace)
            .resultList.map { item -> item[0] as String }
    }

    fun readSpecificTranslations(namespace: String, locale: String, names: Collection<String>) : List<Translation> {
        return this.entityManager.createQuery("select name, value from MessageEntity where namespace = :namespace and locale =:locale and name in :names ", Tuple::class.java)
            .setParameter("namespace", namespace)
            .setParameter("locale", locale)
            .setParameter("names", names)
            .resultList.map { item ->
                Translation(item[0] as String, item[1] as String)
            }
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
