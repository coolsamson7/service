package org.sirius.workflow.persistence

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.sirius.workflow.persistence.entity.ProcessDefinitionEntity
import javax.persistence.*
import org.springframework.stereotype.Component

@Component
class ProcessEntityManager {
    // instance data

    @PersistenceContext
    lateinit var entityManager: EntityManager

    // public

    fun flush() {
        this.entityManager.flush()
    }

    fun persist(entity: ProcessDefinitionEntity) {
        this.entityManager.persist(entity)
    }

    fun foo():  List<ProcessDefinitionEntity>{
        return this.entityManager.createQuery(
            "SELECT p FROM ProcessDefinitionEntity AS p " +
                    "INNER JOIN ( SELECT p1.id AS _id, MAX(p1.deployment) _deployment FROM ProcessDefinitionEntity AS p1 GROUP BY _id) AS pp " +
                    " ON p.id = pp._id AND p.deployment = pp._deployment", ProcessDefinitionEntity::class.java)
            .resultList
    }

    fun findAll() : List<ProcessDefinitionEntity> {
        try {
            return foo()
        }
        catch(e: RuntimeException) {
            println(e)
        }
        return this.entityManager.createQuery("select p from ProcessDefinitionEntity p", ProcessDefinitionEntity::class.java)
            .resultList
    }

    fun find(id: String, deployment: Long) : ProcessDefinitionEntity {
        return this.entityManager.createQuery("select p from ProcessDefinitionEntity p where p.id = :id and p.deployment = :deployment", ProcessDefinitionEntity::class.java)
            .setParameter("id", id)
            .setParameter("deployment", deployment)
            .singleResult
    }

    fun delete(id: String, deployment: Long ) {
        this.entityManager.createQuery("delete from ProcessDefinitionEntity p where p.id = :id and p.deployment = :deployment")
            .setParameter("id", id)
            .setParameter("deployment", deployment)
            .executeUpdate()
    }
}