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
import org.sirius.workflow.bpmn.SchemaElement
import org.springframework.stereotype.Component
import javax.inject.Inject

data class PropertyDescriptor(val name: String, val type: String, var value: Any?)

data class SchemaDescriptor(val properties: List<PropertyDescriptor>)


/*
schema: {
    input: {
    properties: [{name: "a", type: "string length 10", value: }]
    },
    process: {
        properties: [{name: "a", type: "string length 10", value: }]
    }
*/

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

        val userTaskType = modelInstance.model.getType(UserTask::class.java)
        val inputOutputType = modelInstance.model.getType(CamundaInputOutput::class.java)

        val userTasks : Collection<UserTask> = modelInstance.getModelElementsByType(userTaskType) as Collection<UserTask>

        val userTask = userTasks.first { task ->  task.name == taskName}

        val inputOutputs = userTask.getChildElementsByType(CamundaInputOutput::class.java)

        if  (!inputOutputs.isEmpty()) {
            return SchemaDescriptor( inputOutputs.first().camundaInputParameters.map { inputParameter -> PropertyDescriptor(
                inputParameter.camundaName,
                "string", // TODO
                null
            ) })
        }
        else {
            return SchemaDescriptor(emptyList())
        }
    }

    fun processSchema(processDefinitionId: String) : SchemaDescriptor {
        val modelInstance = this.repositoryService.getBpmnModelInstance(processDefinitionId);

        val schemas = modelInstance.getModelElementsByType(SchemaElement::class.java)

        return SchemaDescriptor(
            schemas.map { property -> PropertyDescriptor(
                property.name,
                property.type, // TODO: + constraint
                null
            )
            }
        )
    }
}