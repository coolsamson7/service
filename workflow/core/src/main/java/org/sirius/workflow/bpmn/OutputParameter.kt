package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.instance.camunda.CamundaOutputParameter

interface OutputParameter : CamundaOutputParameter {
    val type: String
}
