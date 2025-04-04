package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.impl.instance.camunda.CamundaInputParameterImpl
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaInputParameter
import org.camunda.bpm.model.xml.ModelBuilder
import org.camunda.bpm.model.xml.impl.instance.ModelTypeInstanceContext
import org.camunda.bpm.model.xml.type.attribute.Attribute


class InputParameterImpl(instanceContext: ModelTypeInstanceContext?) : CamundaInputParameterImpl(instanceContext), InputParameter  {// : CamundaGenericValueElementImpl(instanceContext),
    //InputParameter {

    //override val name: String
    //    get() = nameAttribute!!.getValue(this)

    override fun getCamundaName(): String {
        return nameAttribute.getValue(this)?: ""
    }

    override fun setCamundaName(camundaName: String?) {
        nameAttribute.setValue(this, camundaName)
    }


    override val type: String
        get() = typeAttribute.getValue(this) ?: ""

    override val constraint: String
        get() = constraintAttribute.getValue(this)?: ""

    override val source: String
        get() = sourceAttribute.getValue(this)?: ""

    companion object {
        const val ELEMENT: String = "inputParameter"

        protected lateinit var nameAttribute: Attribute<String>
        protected lateinit var sourceAttribute: Attribute<String>
        protected lateinit var typeAttribute: Attribute<String>
        protected lateinit var constraintAttribute: Attribute<String>

        fun registerType(modelBuilder: ModelBuilder) {
            val typeBuilder = modelBuilder.defineType(InputParameter::class.java, ELEMENT)
                .extendsType(CamundaInputParameter::class.java)
                .namespaceUri(CustomBpmn.NAMESPACE)
                .instanceProvider<InputParameter> { instanceContext -> InputParameterImpl(instanceContext) }

            nameAttribute = typeBuilder.stringAttribute("name")
                .namespace(CustomBpmn.NAMESPACE)
                .required()
                .build()

            sourceAttribute = typeBuilder.stringAttribute("source")
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
