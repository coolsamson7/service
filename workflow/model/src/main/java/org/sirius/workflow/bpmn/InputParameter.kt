package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.instance.camunda.CamundaInputParameter


interface InputParameter : CamundaInputParameter {
    val type: String
    val constraint: String
    val source: String
}