package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.impl.instance.camunda.CamundaOutputParameterImpl
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaInputParameter
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaOutputParameter
import org.camunda.bpm.model.xml.ModelBuilder
import org.camunda.bpm.model.xml.impl.instance.ModelTypeInstanceContext
import org.camunda.bpm.model.xml.type.attribute.Attribute


class OutputParameterImpl(instanceContext: ModelTypeInstanceContext?) : CamundaOutputParameterImpl(instanceContext), OutputParameter {//} CamundaGenericValueElementImpl(instanceContext), OutputParameter {

    //override val name: String
    //  7  get() = nameAttribute!!.getValue(this)

    override fun getCamundaName(): String {
        return nameAttribute.getValue(this)?: ""
    }

    override fun setCamundaName(camundaName: String?) {
        nameAttribute.setValue(this, camundaName)
    }

    override val type: String
        get() = typeAttribute.getValue(this)?: ""

    override val constraint: String
        get() = constraintAttribute.getValue(this)?: ""

    companion object {
        const val ELEMENT: String = "outputParameter"

        protected lateinit var nameAttribute: Attribute<String>
        protected lateinit var typeAttribute: Attribute<String>
        protected lateinit var constraintAttribute: Attribute<String>

        fun registerType(modelBuilder: ModelBuilder) {
            val typeBuilder = modelBuilder.defineType(OutputParameter::class.java, ELEMENT)
                .namespaceUri(CustomBpmn.NAMESPACE)
                .extendsType(CamundaOutputParameter::class.java)
                .instanceProvider<OutputParameter> { instanceContext -> OutputParameterImpl(instanceContext) }

            nameAttribute = typeBuilder.stringAttribute("name")
                .namespace(CustomBpmn.NAMESPACE)
                .required()
                .build()

            typeAttribute = typeBuilder.stringAttribute("type")
                .namespace(CustomBpmn.NAMESPACE)
                .required()
                .build()

            constraintAttribute = typeBuilder.stringAttribute("constraint")
                .namespace(CustomBpmn.NAMESPACE)
                .required()
                .build()

            typeBuilder.build()
        }
    }
}
