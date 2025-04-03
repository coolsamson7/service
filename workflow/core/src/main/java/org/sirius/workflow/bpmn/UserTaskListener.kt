package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.engine.delegate.DelegateTask
import org.sirius.workflow.tasklist.TasklistHandler

class UserTaskListener : org.camunda.bpm.engine.delegate.TaskListener {
    // override TaskListener

    override fun notify(delegateTask: DelegateTask) {
        TasklistHandler.INSTANCE.notify(delegateTask)
    }

    // companion

    companion object {
        val instance = UserTaskListener()
    }
}