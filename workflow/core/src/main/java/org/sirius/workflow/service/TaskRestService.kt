package org.sirius.workflow.service

import org.camunda.bpm.engine.RepositoryService
import org.camunda.bpm.engine.TaskService
import org.camunda.bpm.engine.impl.persistence.entity.TaskEntity
import org.camunda.bpm.engine.task.Task
import org.camunda.bpm.model.bpmn.BpmnModelInstance
import org.sirius.workflow.bpmn.SchemaElement
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*
import kotlin.system.exitProcess

data class TaskDTO(val id: String, val processId: String, val name: String, val description: String, val owner : String?, val assignee: String?, val form: String?)

data class TaskQuery(
    val user: String? = null,
    val active : Boolean? = null,
    val assigned: Boolean? = null,
    val unassigned: Boolean? = null,
    val assignee: String? = null
)

data class Variables(val process: SchemaDescriptor, val input: SchemaDescriptor)

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
            task.name,
            if ( task.description == null) "" else  task.description , // TODO
            task.owner,
            task.assignee,
            task.formKey
        ) }
    }

    @GetMapping("complete/{id}")
    fun completeTask(@PathVariable id: String) {
        taskService.complete(id)
    }

    @GetMapping("claim/{id}/{user}")
    fun claimTask(@PathVariable id: String, @PathVariable user: String) {
        taskService.claim(id, user)
    }

    @GetMapping("task-variables/{processDefinition}/{task}/{taskName}")
    @ResponseBody
    fun getTaskVariables(@PathVariable processDefinition: String, @PathVariable task: String, @PathVariable taskName: String, ) : Variables {
        // process

        val processSchema = this.metadataService.processSchema(processDefinition)

        for (property in processSchema.properties)
            property.value = this.taskService.getVariable(task, property.name)

        // task

        val taskSchema = this.metadataService.taskInputSchema(processDefinition, taskName)

        for (property in taskSchema.properties)
            property.value = this.taskService.getVariableLocal(task, property.name)

        // done

        return Variables(processSchema, taskSchema)
    }
}
