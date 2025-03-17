package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.instance.BpmnModelElementInstance
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaGenericValueElement
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaInputParameter

/*
interface InputParameter : BpmnModelElementInstance, CamundaGenericValueElement {
    val name: String
    val type: String
}*/

interface InputParameter : CamundaInputParameter {
    val type: String
    val source: String
}