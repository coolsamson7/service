package org.sirius.workflow.service.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.workflow.model.Form
import org.sirius.workflow.persistence.FormEntityManager
import org.sirius.workflow.persistence.entity.FormDefinitionEntity
import org.sirius.workflow.service.FormService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import javax.transaction.Transactional

@CrossOrigin(
    origins = [ "http://localhost:8080", "http://localhost:4200"],
    methods = [
        RequestMethod.OPTIONS,
        RequestMethod.GET,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.POST
    ])
@Component
@RestController
class FormServiceImpl : FormService {
    // instance data

    @Autowired
    lateinit var entityManager: FormEntityManager

    // implement

    @Transactional
    override fun create(form: Form): Form {
        val entity = FormDefinitionEntity(
            form.id,
            form.deployment,
            form.name,
            form.bpmn,
            form.xml
        )

        entityManager.persist(entity)
        entityManager.flush() // we need the key

        return Form(
            entity.id,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml
        )
    }

    @Transactional
    override fun find4Process(@PathVariable id: String, @PathVariable name: String) : Form {
        try {
            val entity = this.entityManager.find4Process(id, name)

            return Form(
                entity.id,
                entity.deployment,
                entity.name,
                entity.bpmn,
                entity.xml
            )
        }
        catch( e: Exception) {
            println("aaa")
            throw e
        }
    }

    @Transactional
    override fun read(id: String, deployment: Long, name: String) : Form {
        val entity = this.entityManager.find(id, deployment, name)

        return Form(
            entity.id,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml
        )
    }

    @Transactional
    override fun update(form: Form): Form {
        val entity = this.entityManager.find(form.id, form.deployment, form.name)

        entity.xml = form.xml // TODO more? bpmn
        entity.bpmn = form.bpmn

        entityManager.flush()

        return Form(
            entity.id!!,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml
        )
    }

    @Transactional
    override fun delete(id: String, deployment: Long, name: String) {
        this.entityManager.delete(id, deployment, name)
    }
}
