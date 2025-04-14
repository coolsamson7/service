package org.sirius.workflow.persistence

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.workflow.persistence.entity.FormDefinitionEntity
import javax.persistence.*
import org.springframework.stereotype.Component

@Component
class FormEntityManager {
    // instance data

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    // public

    fun flush() {
        this.entityManager.flush()
    }

    fun persist(entity: FormDefinitionEntity) {
        this.entityManager.persist(entity)
    }

    fun all() : List<FormDefinitionEntity> {
        return this.entityManager.createQuery("select p from FormDefinitionEntity p", FormDefinitionEntity::class.java)
            .resultList
    }

    fun readAll(id: String, deployment: Long) : List<FormDefinitionEntity> {
        return this.entityManager.createQuery("select p from FormDefinitionEntity p where p.id = :id and p.deployment = :deployment", FormDefinitionEntity::class.java)
            .setParameter("id", id)
            .setParameter("deployment", deployment)
            .resultList
    }

    fun find(id: String, deployment: Long, name: String) : FormDefinitionEntity {
        return this.entityManager.createQuery("select p from FormDefinitionEntity p where p.id = :id and p.deployment = :deployment and p.name = :name", FormDefinitionEntity::class.java)// this.entityManager.createQuery("select p from FormDefinitionEntity p where p.id = :id and p.deployment = :deployment and p.name = :name", FormDefinitionEntity::class.java)
            .setParameter("id", id)
            .setParameter("deployment", deployment)
            .setParameter("name", name)
            .singleResult
    }

    fun find4Process(id: String, name: String) : FormDefinitionEntity {
        return this.entityManager.createQuery("select p from FormDefinitionEntity p where p.bpmn = :id and p.name = :name", FormDefinitionEntity::class.java)// and p.deployment = :deployment this.entityManager.createQuery("select p from FormDefinitionEntity p where p.id = :id and p.deployment = :deployment and p.name = :name", FormDefinitionEntity::class.java)
            .setParameter("id", id)
            .setParameter("name", name)
            .singleResult
    }

    fun deleteAll(id: String, deployment: Long) {
        this.entityManager.createQuery("delete from FormDefinitionEntity p where p.id = :id and p.deployment = :deployment ")
            .setParameter("id", id)
            .setParameter("deployment", deployment)
            .executeUpdate()
    }

   fun delete(id: String, deployment: Long, name: String) {
    this.entityManager.createQuery("delete from FormDefinitionEntity p where p.id = :id and p.deployment = :deployment  and p.name = :name ")
        .setParameter("id", id)
        .setParameter("deployment", deployment)
        .setParameter("name", name)
        .executeUpdate()
    }
}