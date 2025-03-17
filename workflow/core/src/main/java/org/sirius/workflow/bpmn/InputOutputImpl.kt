package org.sirius.workflow.bpmn
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.camunda.bpm.model.bpmn.impl.instance.BpmnModelElementInstanceImpl
import org.camunda.bpm.model.xml.ModelBuilder
import org.camunda.bpm.model.xml.impl.instance.ModelTypeInstanceContext
import org.camunda.bpm.model.xml.type.child.ChildElementCollection

class InputOutputImpl(instanceContext: ModelTypeInstanceContext?) : BpmnModelElementInstanceImpl(instanceContext),
    InputOutput {

    override val inputParameters: Collection<InputParameter>
        get() = inputParameterCollection!![this]

    override val outputParameters: Collection<OutputParameter>
        get() = outputParameterCollection!![this]

    companion object {
        const val ELEMENT: String = "inputOutput"

        protected var inputParameterCollection: ChildElementCollection<InputParameter>? = null
        protected var outputParameterCollection: ChildElementCollection<OutputParameter>? = null

        fun registerType(modelBuilder: ModelBuilder) {
            val typeBuilder =
                modelBuilder.defineType(InputOutput::class.java, ELEMENT)
                    .namespaceUri(CustomBpmn.NAMESPACE)
                    .instanceProvider<InputOutput> { instanceContext -> InputOutputImpl(instanceContext) }

            val sequenceBuilder = typeBuilder.sequence()

            inputParameterCollection = sequenceBuilder.elementCollection(InputParameter::class.java)
                .build()

            outputParameterCollection = sequenceBuilder.elementCollection(OutputParameter::class.java)
                .build()

            typeBuilder.build()
        }
    }
}
