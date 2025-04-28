package org.sirius.workflow.service

import org.camunda.bpm.engine.RepositoryService
import org.camunda.bpm.engine.RuntimeService
import org.camunda.bpm.engine.TaskService
import org.camunda.bpm.engine.impl.persistence.entity.TaskEntity
import org.camunda.bpm.engine.task.Task
import org.camunda.bpm.model.bpmn.BpmnModelInstance
import org.camunda.spin.json.SpinJsonNode
import org.sirius.workflow.bpmn.SchemaElement
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*
import java.util.HashMap
import kotlin.system.exitProcess

data class TaskDTO(
    val id: String,
    val processDefinitionId: String,
    val processId: String,
    val name: String,
    val description: String,
    val owner : String?,
    val assignee: String?,
    val form: String?
)

data class TaskOutput(val output: Map<String,Any>, val process: Map<String,Any>)

data class TaskQuery(
    val user: String? = null,
    val active : Boolean? = null,
    val assigned: Boolean? = null,
    val unassigned: Boolean? = null,
    val assignee: String? = null
)

data class Variables(val process: SchemaDescriptor, val input: SchemaDescriptor, val output: SchemaDescriptor)

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
@RequestMapping(value = ["bpmn/task/"])
class TaskRestService {
    // instance data

    @Autowired
    private lateinit var taskService: TaskService
    @Autowired
    private lateinit var runtimeService: RuntimeService
    @Autowired
    private lateinit var repositoryService: RepositoryService
    @Autowired
    private lateinit var metadataService: MetadataService

    // methods

    @PostMapping("tasks")
    @ResponseBody
    fun getTasks(@RequestBody filter: TaskQuery): List<TaskDTO> { // TODO
        var query = taskService.createTaskQuery()

        query.initializeFormKeys()

        // active

        if ( filter.active != null)
            query = query.active()

        /* assigned

        if ( filter.assigned != null)
            query = query.taskAssigned()

        if ( filter.unassigned != null)
            query = query.taskUnassigned() */

        // assignee

        if ( filter.assignee != null)
            query = query.taskAssigneeIn(filter.assignee)

        // user

        if ( filter.user != null)
            query = query.taskCandidateUser(filter.user)

        // execute

        return query .list().map { task -> TaskDTO(
            task.id,
            task.processDefinitionId,
            task.processInstanceId,
            task.name,
            if ( task.description == null) "" else  task.description , // TODO
            task.owner,
            task.assignee,
            task.formKey
        ) }
    }

    // TODO: refactor

    fun collectOutput(definition: String, process: String, taskId: String, taskName: String, outputValues : Map<String,Any> ) {
        // read instance

        val instance = this.repositoryService.getBpmnModelInstance(definition)

        val descriptor = this.metadataService.taskOutputSchema(definition, taskName)

        // retrieve variable

        val output = this.runtimeService.getVariable(process, "output") as SpinJsonNode

        var node = output

        if ( !node.hasProp(taskName))
            node.prop(taskName, HashMap())

        node = node.prop(taskName)

        // set values

        for ( descriptor in descriptor.properties) {
            val name = descriptor.name
            val value = outputValues.get(name)

            when (descriptor.type) {
                "String" -> node.prop(name, value as String)
                "Boolean" -> node.prop(name, value as Boolean)
                "Short" -> node.prop(name, value as Number)
                "Long" -> node.prop(name, value as Number)
                "Int" -> node.prop(name, value as Number)
                "Double" -> node.prop(name, (value as Double).toFloat())

                else -> {
                    throw RuntimeException("bad type")
                }
            }
        }

        // write

        this.runtimeService.setVariable(process, "output", output)
    }

    @PostMapping("complete/{definition}/{process}/{id}/{name}")
    fun completeTask(@PathVariable definition: String, @PathVariable process: String, @PathVariable id: String, @PathVariable name: String, @RequestBody output : TaskOutput) {
        this.collectOutput(definition, process, id, name, output.output)

        taskService.setVariables(id, output.process)

        taskService.complete(id)
    }

    @GetMapping("claim/{id}/{user}")
    fun claimTask(@PathVariable id: String, @PathVariable user: String) {
        taskService.claim(id, user)
    }

    @PostMapping("task-variables/{processDefinition}/{task}/{taskName}")
    @ResponseBody
    fun getTaskVariables(@PathVariable processDefinition: String, @PathVariable task: String, @PathVariable taskName: String, @RequestBody() processVariables: Array<String> ) : Variables {
        // process

        val processSchema = this.metadataService.processSchema(processDefinition)

        processSchema.properties = processSchema.properties.filter { prop -> processVariables.contains(prop.name) }
        for (property in processSchema.properties)
            property.value = this.taskService.getVariable(task, property.name)

        // input

        val inputSchema = this.metadataService.taskInputSchema(processDefinition, taskName)

        for (property in inputSchema.properties)
            property.value = this.taskService.getVariable(task, property.name)

        // output

        val outputSchema = this.metadataService.taskOutputSchema(processDefinition, taskName)

        // done

        return Variables(processSchema, inputSchema, outputSchema)
    }
}
