package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.instance.BpmnModelElementInstance


interface InputOutput : BpmnModelElementInstance {
    val inputParameters: Collection<InputParameter>

    val outputParameters: Collection<OutputParameter>
}
