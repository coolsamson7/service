package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.engine.delegate.DelegateTask
import org.camunda.bpm.engine.delegate.TaskListener
import org.sirius.workflow.tasklist.TasklistHandler

class UserTaskListener : org.camunda.bpm.engine.delegate.TaskListener {

    override fun notify(delegateTask: DelegateTask) {
        TasklistHandler.INSTANCE.notify(delegateTask)
    }

    companion object {
        //var assigneeList: MutableList<String?> = ArrayList<String?>()

        val instance = UserTaskListener()
    }
}