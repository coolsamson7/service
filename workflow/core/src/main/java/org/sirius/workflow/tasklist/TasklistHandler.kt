package org.sirius.workflow.tasklist

import org.camunda.bpm.engine.delegate.DelegateTask
import org.sirius.workflow.service.TaskDTO
import org.sirius.workflow.service.TaskQuery
import org.sirius.workflow.service.TaskRestService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.Message
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import org.springframework.stereotype.Controller
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject


data class UserEntry(val user: String, var tasks: MutableList<TaskDTO>) {

}

data class TasklistDelta(val added: MutableList<TaskDTO>, val deleted: MutableList<TaskDTO>)

class Request(val id: String, val request: String, val args: Array<Any>)

class Response(val id: String, val response: String, val result: Any)


@Controller
class TasklistHandler {
    // instance data

    @Inject
    lateinit var taskService : TaskRestService

    val registry = ConcurrentHashMap<String,UserEntry>()

    @Autowired
    private lateinit var simpMessagingTemplate: SimpMessagingTemplate

    // constructor

    constructor() {
        INSTANCE = this
    }

    // websocket stuff

    @MessageMapping("/call")
    fun handle(request: Request) {
        var result : Any = when (request.request) {
            "register" -> register(request.args[0] as String)
            "unregister" -> unregister(request.args[0] as String)
            else -> {println("unknown request " + request.request) ; "ok"}
        }

        // send result

        simpMessagingTemplate.convertAndSend("/notifier/result", Response(request.id, request.request, result))
    }

    fun send(request: Request) {
        simpMessagingTemplate.convertAndSend("/notifier/call", request)
    }

    // public

    fun tasklistUpdate(delta: TasklistDelta) {
        this.send(Request("", "tasklist", arrayOf(delta)))
    }

    fun updateList() {
        for (entry in registry.entries.iterator()) {
            val userEntry = entry.value

            val oldList = userEntry.tasks
            val newList = taskService.getTasks(TaskQuery(null, false, false, true, userEntry.user)) // TODO

            // compute delta

            val added = ArrayList<TaskDTO>()
            val deleted = ArrayList<TaskDTO>()

            // TODO

            for ( task in newList) {
                if (oldList.find { t -> t.id === task.id  } == null)
                    added.add(task)
            }

            for ( task in oldList) {
                if (newList.find { t -> t.id === task.id  } == null)
                    deleted.add(task)
            }

            if ( added.isNotEmpty() || deleted.isNotEmpty()) {
                // update internal list

                userEntry.tasks = newList as MutableList<TaskDTO>

                // done

                tasklistUpdate(TasklistDelta(added, deleted))
            }
        }
    }

    // public

    fun register(user: String) : List<TaskDTO> {
        val list = taskService.getTasks(TaskQuery(null, false, false, true, user))

        this.registry[user] = UserEntry(user, list as MutableList<TaskDTO>)

        return list
    }

    fun unregister(user: String) : String {
        this.registry.remove(user)

        return "Ok"
    }

    fun notify(delegateTask: DelegateTask) {
        this.updateList()
    }

    companion object {
        lateinit var  INSTANCE : TasklistHandler
    }
}