package org.sirius.workflow.bpmn

import org.camunda.bpm.model.bpmn.Bpmn
import org.camunda.bpm.model.xml.ModelBuilder

class CustomBpmn : Bpmn() {
    // override Bpmn

    override fun doRegisterTypes(modelBuilder: ModelBuilder) {
        // super

        super.doRegisterTypes(modelBuilder)

        // schema

        SchemaPropertyElementImpl.registerType(modelBuilder)
        SchemaElementImpl.registerType(modelBuilder)

        // input / output

        //InputOutputImpl.registerType(modelBuilder)
        InputParameterImpl.registerType(modelBuilder)
        OutputParameterImpl.registerType(modelBuilder)
    }

    companion object {
        const val NAMESPACE: String = "http://camunda.org/bpmn/examples"
    }
}