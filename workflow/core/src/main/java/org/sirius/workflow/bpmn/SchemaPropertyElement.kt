package org.sirius.workflow.bpmn

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.xml.instance.ModelElementInstance

interface SchemaPropertyElement : ModelElementInstance  {
    val name: String
    val type: String
    val value: String
}