package org.sirius.workflow.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.engine.RepositoryService
import org.camunda.bpm.engine.TaskService
import org.camunda.bpm.engine.task.Task
import org.camunda.bpm.model.bpmn.instance.UserTask
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaInputOutput
import org.sirius.workflow.bpmn.InputParameter
import org.sirius.workflow.bpmn.OutputParameter
import org.sirius.workflow.bpmn.SchemaElement
import org.springframework.stereotype.Component
import javax.inject.Inject

data class PropertyDescriptor(val name: String, val type: String, val constraint: String, var value: Any?)

data class SchemaDescriptor(var properties: List<PropertyDescriptor>)

@Component
class MetadataService {
    // instance data

    @Inject
    private lateinit var repositoryService: RepositoryService
    @Inject
    private lateinit var taskService: TaskService

    // methods

    fun taskInputSchemaAndValues(task: Task) : SchemaDescriptor {
        val descriptor = this.taskInputSchema(task.processDefinitionId, task.id)

        descriptor.properties.forEach { property ->
            property.value = taskService.getVariableLocal(task.id, property.name)
        }
        return descriptor
    }

    fun taskInputSchema(processDefinitionId: String, taskName: String) : SchemaDescriptor {
        val modelInstance = this.repositoryService.getBpmnModelInstance(processDefinitionId);

        val userTasks : Collection<UserTask> = modelInstance.getModelElementsByType(UserTask::class.java) as Collection<UserTask>

        val userTask = userTasks.first { task ->  task.name == taskName}

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

    fun taskOutputSchema(processDefinitionId: String, taskName: String) : SchemaDescriptor {
        val modelInstance = this.repositoryService.getBpmnModelInstance(processDefinitionId);

        val userTasks : Collection<UserTask> = modelInstance.getModelElementsByType(UserTask::class.java) as Collection<UserTask>

        val userTask = userTasks.first { task ->  task.name == taskName}

        val inputOutputs = userTask.extensionElements.getChildElementsByType(CamundaInputOutput::class.java)

        if  (!inputOutputs.isEmpty()) {
            val inputOutput = inputOutputs.first()

            return SchemaDescriptor(inputOutput.getChildElementsByType(OutputParameter::class.java).map {
                outputParameter -> PropertyDescriptor(
                outputParameter.camundaName,
                outputParameter.type,
                outputParameter.constraint,
                null)
            })
        }
        else {
            return SchemaDescriptor(emptyList())
        }
    }

    fun processSchema(processDefinitionId: String) : SchemaDescriptor {
        val modelInstance = this.repositoryService.getBpmnModelInstance(processDefinitionId);

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