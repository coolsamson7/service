package org.sirius.workflow.service.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.Bpmn
import org.camunda.bpm.model.bpmn.BpmnModelInstance
import org.camunda.bpm.model.bpmn.instance.UserTask
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*

import org.camunda.bpm.model.bpmn.instance.camunda.*

import org.sirius.workflow.bpmn.*
import org.sirius.workflow.service.ProcessDefinitionService
import org.sirius.workflow.service.ProcessService
import org.sirius.workflow.service.PropertyDescriptor
import org.sirius.workflow.service.SchemaDescriptor
import org.sirius.workflow.service.TaskSchema


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
class ProcessDefinitionServiceImpl : ProcessDefinitionService {
    // instance data

    @Autowired
    lateinit var processService: ProcessService

    // private

    private fun readModelInstance(id: String, deployment: Long) : BpmnModelInstance {
        val process = processService.read(id, deployment)

        Bpmn.INSTANCE = CustomBpmn()

        return Bpmn.readModelFromStream(process.xml.byteInputStream())
    }

    // implement ProcessDefinitionService

    override fun taskSchema(@PathVariable process: String, @PathVariable deployment: Long, @PathVariable task: String) : TaskSchema {
        // read instance

        val modelInstance = this.readModelInstance(process, deployment)
        val userTask = modelInstance.getModelElementsByType(UserTask::class.java).first { useTask ->  useTask.name == task}

        // process

        val schemas = modelInstance.getModelElementsByType(SchemaElement::class.java)

        val processSchema =  if ( schemas.isEmpty())
            SchemaDescriptor(emptyList())
        else
            SchemaDescriptor(schemas.first().properties.map { property -> PropertyDescriptor(
                property.name,
                property.type,
                property.constraint,
                null
            )})

        // input

        val inputOutputs = userTask.extensionElements.getChildElementsByType(CamundaInputOutput::class.java)

        val inputSchema = if  (!inputOutputs.isEmpty()) {
            SchemaDescriptor( inputOutputs.first().getChildElementsByType(InputParameter::class.java).map { inputParameter ->
                PropertyDescriptor(
                    inputParameter.camundaName,
                    inputParameter.type,
                    inputParameter.constraint,
                    null
                )
            })
        }
        else SchemaDescriptor(emptyList())

        // output

        val outputSchema = if  (!inputOutputs.isEmpty()) {
            SchemaDescriptor( inputOutputs.first().getChildElementsByType(OutputParameter::class.java).map { outputParameter ->
                PropertyDescriptor(
                    outputParameter.camundaName,
                    outputParameter.type,
                    outputParameter.constraint,
                    null
                )
            })
        }
        else SchemaDescriptor(emptyList())

        // done

        return TaskSchema(processSchema, inputSchema, outputSchema)
    }

    override fun taskInputSchema(process: String, deployment: Long, task: String) : SchemaDescriptor {
        val modelInstance = this.readModelInstance(process, deployment);

        val userTasks : Collection<UserTask> = modelInstance.getModelElementsByType(UserTask::class.java) as Collection<UserTask>

        val userTask = userTasks.first { useTask ->  useTask.name == task}

        val inputOutputs = userTask.extensionElements.getChildElementsByType(CamundaInputOutput::class.java)

        if  (!inputOutputs.isEmpty()) {
            val inputOutput = inputOutputs.first()

            return SchemaDescriptor(inputOutput.getChildElementsByType(InputParameter::class.java).map { inputParameter ->
                PropertyDescriptor(
                    inputParameter.camundaName,
                    inputParameter.type,
                    inputParameter.constraint,
                    null
                )
            })
        }
        else {
            return SchemaDescriptor(emptyList())
        }
    }

    override fun processSchema(process: String,  deployment: Long) : SchemaDescriptor {
        val modelInstance = this.readModelInstance(process, deployment);

        val schemas = modelInstance.getModelElementsByType(SchemaElement::class.java)


        if ( schemas.isEmpty())
            return SchemaDescriptor(emptyList())
        else
            return SchemaDescriptor(
                schemas.first().properties.map { property -> PropertyDescriptor(
                    property.name,
                    property.type,
                    property.constraint,
                    null
                )
                }
            )
    }
}
