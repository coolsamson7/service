package org.sirius.workflow.service.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.workflow.model.*
import org.sirius.workflow.persistence.FormEntityManager
import org.sirius.workflow.persistence.ProcessEntityManager
import org.sirius.workflow.persistence.entity.FormDefinitionEntity
import org.sirius.workflow.persistence.entity.ProcessDefinitionEntity
import org.sirius.workflow.service.ProcessService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.transaction.Transactional

@Component
@CrossOrigin(
    origins = [ "http://localhost:8080", "http://localhost:4200"],
    methods = [
        RequestMethod.OPTIONS,
        RequestMethod.GET,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.POST
    ])
@RestController
class ProcessServiceImpl : ProcessService {
    // instance data

    @Autowired
    lateinit var entityManager: ProcessEntityManager
    @Autowired
    lateinit var formEntityManager: FormEntityManager

    // implement ProcessService

    @Transactional
    override fun create(@PathVariable name: String, @RequestBody xml: String): Process {
        val entity = ProcessDefinitionEntity(
            UUID.randomUUID().toString(),//ProcessId(null, 0),
            0,
            "",
            name,
            xml
        )

        entityManager.persist(entity)
        entityManager.flush() // we need the key

        return Process(
            entity.id!!,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml,
            emptyList()
        )
    }

    @Transactional
    override fun readAll() : List<Process> {
        // TODO: letzter!
        return this.entityManager.findAll().map { process ->
            Process(
                process.id!!,
                process.deployment,
                process.name,
                process.bpmn,
                process.xml,
                formEntityManager.readAll(process.id!!, process.deployment).map { entity -> Form(
                    entity.id,
                    entity.deployment,
                    entity.name,
                    entity.bpmn,
                    entity.xml
                )
                }
            )
        }
    }

    @Transactional
    override fun read(@PathVariable id: String, @PathVariable deployment: Long) : Process {
        val entity = this.entityManager.find(id, deployment)

        val forms = formEntityManager.readAll(id, deployment).map { entity -> Form(
            entity.id,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml
        )
        }

        return Process(
            entity.id!!,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml,
            forms
        )
    }


    @Transactional
    override fun update(@RequestBody process: Process): Process {
        val entity = this.entityManager.find(process.id, process.deployment)

        entity.xml = process.xml
        entity.bpmn = ""

        val forms = formEntityManager.readAll(process.id, process.deployment).map { entity -> Form(
            entity.id,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml
        )
        }


        entityManager.flush()

        return Process(
            entity.id!!,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml,
            forms
        )
    }

    @Transactional
    override fun publish(@PathVariable id: String, @PathVariable deployment: Long, @PathVariable bpmn: String) : Process {
        var entity = this.entityManager.find(id, deployment)

        // copy process

        entity = ProcessDefinitionEntity(
            entity.id,
            entity.deployment + 1,
            bpmn,
            entity.name,
            entity.xml
        )

        // copy forms

        formEntityManager.readAll(id, deployment).forEach { form ->
            val copiedForm =  FormDefinitionEntity(
                form.id,
                entity.deployment, // new deployment
                form.name,
                bpmn,
                form.xml
            )

            println("### copied form " + form.id + "[" +  entity.deployment + "]" + bpmn)
            formEntityManager.persist(copiedForm)
        }

        // done

        entityManager.persist(entity)
        entityManager.flush()

        // done

        return Process(
            entity.id!!,
            entity.deployment,
            entity.name,
            entity.bpmn,
            entity.xml,
            formEntityManager.readAll(entity.id!!, entity.deployment).map { entity -> Form(
                entity.id,
                entity.deployment,
                entity.name,
                entity.bpmn,
                entity.xml
            )
            }

        )
    }

    @Transactional
    override fun delete(@PathVariable id: String, @PathVariable deployment: Long) {
        // delete process

        entityManager.delete(id, deployment)

        // delete all forms

        formEntityManager.deleteAll(id, deployment)
    }
}
