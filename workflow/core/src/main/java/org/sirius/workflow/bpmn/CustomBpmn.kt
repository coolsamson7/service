package org.sirius.workflow.bpmn

import org.camunda.bpm.model.bpmn.Bpmn
import org.camunda.bpm.model.xml.ModelBuilder

class CustomBpmn : Bpmn() {
    // override Bpmn

    override fun doRegisterTypes(modelBuilder: ModelBuilder) {
        // super

        super.doRegisterTypes(modelBuilder)

        // register the Schema element type so that XML elements are parsed to instances of KPIElement

        SchemaElementImpl.registerType(modelBuilder)
    }

    companion object {
        const val CUSTOM_NAMESPACE: String = "http://camunda.org/bpmn/examples"
    }
}