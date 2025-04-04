package org.sirius.workflow.bpmn

import org.camunda.bpm.model.xml.instance.ModelElementInstance


interface SchemaElement : ModelElementInstance {
    val name: String
    val properties: Collection<SchemaPropertyElement>
}