package org.sirius.workflow.tasklist

import org.camunda.bpm.engine.delegate.DelegateTask
import org.sirius.workflow.service.TaskDTO
import org.sirius.workflow.service.TaskQuery
import org.sirius.workflow.service.TaskRestService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.handler.annotation.Header
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessageHeaderAccessor
import org.springframework.messaging.simp.SimpMessageType
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.web.session.HttpSessionEventPublisher
import org.springframework.stereotype.Component
import org.springframework.stereotype.Controller
import java.security.Principal
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.servlet.http.HttpSessionEvent




data class UserEntry(val session: String, val user: String, var tasks: MutableList<TaskDTO>) {

}

data class TasklistDelta(val added: MutableList<TaskDTO>, val deleted: MutableList<TaskDTO>) {
    fun isEmpty() : Boolean {
        return added.isEmpty() && deleted.isEmpty()
    }
}

class Request(val id: String, val session: String, val request: String, val args: Array<Any>)

class Response(val id: String, val response: String, val result: Any)

@Component
class MyHttpSessionEventPublisher : HttpSessionEventPublisher() {
    // instance data

    @Inject lateinit var tasklistHandler : TasklistHandler

    // override

    override fun sessionCreated(event: HttpSessionEvent) {
        println("##### SESSION CREATED")

        super.sessionCreated(event)

        //event.getSession().setMaxInactiveInterval(10) // in s
    }

    override fun sessionDestroyed(event: HttpSessionEvent) {
        println("##### SESSION DESTROYED")

        super.sessionDestroyed(event)

        tasklistHandler.removeSession(event.session.id)
    }
}

@Controller
class TasklistHandler {
    // instance data

    @Inject
    lateinit var taskService : TaskRestService

    val registry = ConcurrentHashMap<String,UserEntry>()

    @Autowired
    private lateinit var simpMessagingTemplate: SimpMessagingTemplate

    var needUpdate = false

    // constructor

    constructor() {
        INSTANCE = this
    }

    fun removeSession(session: String) {
        registry.remove(session)
    }

    // websocket stuff

    @MessageMapping("/call")
    fun handle(request: Request, user: Principal , @Header("simpSessionId") sessionId: String ) {println("### session=" + user.name + ", websocket-session=" + sessionId)
        var result : Any = when (request.request) {
            "register" -> register(request.session, request.args[0] as String)
            "unregister" -> unregister(request.session, request.args[0] as String)
            else -> {println("unknown request " + request.request) ; "ok"}
        }

        // send result

        val headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE)
        headerAccessor.sessionId = user.name
        headerAccessor.setLeaveMutable(true)

        //simpMessagingTemplate.convertAndSendToUser(sessionId, "/user/queue/result", Response(request.id, request.request, result), headerAccessor1.messageHeaders)

        simpMessagingTemplate.convertAndSend("/session/result" + request.session, Response(request.id, request.request, result))//, headerAccessor1.messageHeaders)
    }

    fun send(user: String, request: Request) {
        //NEW simpMessagingTemplate.convertAndSendToUser(user, "/queue/call", request)
        simpMessagingTemplate.convertAndSend("/session/call" + request.session, request) // NEW
    }

    // public

    fun tasklistUpdate(user: String, delta: TasklistDelta) {
        this.send(user, Request("", user,  "tasklist", arrayOf(delta)))
    }

    fun computeDelta(old: List<TaskDTO>, new: List<TaskDTO>) : TasklistDelta {
        val added = ArrayList<TaskDTO>()
        val deleted = ArrayList<TaskDTO>()

        val map = HashMap<String, TaskDTO>()

        // collect all old tasks in a map

        for (task in old)
            map[task.id] = task

        // iterate over new objects

        for (task in new) {
            if (!map.containsKey(task.id))
                added.add(task)

            else {
                // possibly update

                // TODO?

                map.remove(task.id)
            } // else

        } // for

        // deleted

        for (task in map.values)
            deleted.add(task)

        return TasklistDelta(added, deleted)
    }

    fun triggerUpdate() {
        needUpdate = true
    }

    // every s

    @Scheduled(fixedRate = 1000)
    fun checkUpdate() {
        if ( needUpdate ) {
            needUpdate = false

            this.updateList()
        }
    }


    fun updateList() {
        for (entry in registry.entries.iterator()) {
            val userEntry = entry.value

            val newList = taskService.getTasks(TaskQuery(null, false, false, true, userEntry.user))
            val delta = this.computeDelta(userEntry.tasks,  newList)

            if ( !delta.isEmpty()) {
                // update internal list

                userEntry.tasks = newList as MutableList<TaskDTO>

                // broadcast delta

                tasklistUpdate(userEntry.session, delta)
            }
        }
    }

    // public

    fun register(session: String, user: String) : List<TaskDTO> {
        val list = taskService.getTasks(TaskQuery(null, false, false, true, user))

        this.registry[session] = UserEntry(session, user, list as MutableList<TaskDTO>)

        return list
    }

    fun unregister(session: String, user: String) : String {
        this.registry.remove(session)

        return "Ok"
    }

    fun notify(delegateTask: DelegateTask) {
        this.triggerUpdate()
    }

    companion object {
        lateinit var  INSTANCE : TasklistHandler
    }
}