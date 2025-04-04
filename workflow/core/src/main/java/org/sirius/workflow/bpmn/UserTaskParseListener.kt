package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */


import org.camunda.bpm.engine.delegate.TaskListener
import org.camunda.bpm.engine.impl.bpmn.behavior.UserTaskActivityBehavior
import org.camunda.bpm.engine.impl.bpmn.parser.AbstractBpmnParseListener
import org.camunda.bpm.engine.impl.pvm.delegate.ActivityBehavior
import org.camunda.bpm.engine.impl.pvm.process.ScopeImpl

import org.camunda.bpm.engine.impl.pvm.process.ActivityImpl

import org.camunda.bpm.engine.impl.util.xml.Element

class UserTaskParseListener : AbstractBpmnParseListener() {
     // override

     override fun parseUserTask(userTaskElement: Element, scope: ScopeImpl, activity: ActivityImpl) {
        val activityBehavior: ActivityBehavior? = activity.getActivityBehavior()
        if (activityBehavior is UserTaskActivityBehavior) {
            val userTaskActivityBehavior = activityBehavior

            // is that enough? claim???

            userTaskActivityBehavior
                .getTaskDefinition()
                .addTaskListener(TaskListener.EVENTNAME_CREATE, UserTaskListener.instance)

            userTaskActivityBehavior
                .getTaskDefinition()
                .addTaskListener(TaskListener.EVENTNAME_DELETE, UserTaskListener.instance)

            userTaskActivityBehavior
                .getTaskDefinition()
                .addTaskListener(TaskListener.EVENTNAME_COMPLETE, UserTaskListener.instance)

        }
    }
}