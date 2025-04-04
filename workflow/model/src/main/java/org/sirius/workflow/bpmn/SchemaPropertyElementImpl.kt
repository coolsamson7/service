package org.sirius.workflow.bpmn

import org.camunda.bpm.model.xml.ModelBuilder
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl
import org.camunda.bpm.model.xml.impl.instance.ModelTypeInstanceContext
import org.camunda.bpm.model.xml.type.attribute.Attribute


class SchemaPropertyElementImpl(instanceContext: ModelTypeInstanceContext?) : ModelElementInstanceImpl(instanceContext),
    SchemaPropertyElement {

        // override

    override val name: String
        get() = nameAttribute!!.getValue(this)

    override val type: String
        get() = typeAttribute!!.getValue(this)

    override val constraint: String
        get() = constraintAttribute!!.getValue(this)

    override val value: String
        get() = valueAttribute!!.getValue(this)

    // companion

    companion object {
        const val ELEMENT: String = "property"

        protected var nameAttribute: Attribute<String>? = null
        protected var typeAttribute: Attribute<String>? = null
        protected var valueAttribute: Attribute<String>? = null
        protected var constraintAttribute: Attribute<String>? = null

        fun registerType(modelBuilder: ModelBuilder) {
            // declare a new element type

            val typeBuilder =
                modelBuilder
                    .defineType(SchemaPropertyElement::class.java, ELEMENT)
                    .namespaceUri(CustomBpmn.NAMESPACE)
                    .instanceProvider<SchemaPropertyElement> { instanceContext ->
                        SchemaPropertyElementImpl(instanceContext)
                    }

            // declare attributes

            nameAttribute = typeBuilder.stringAttribute("name")
                .namespace(CustomBpmn.NAMESPACE)
                .build()

            typeAttribute = typeBuilder.stringAttribute("type")
                .namespace(CustomBpmn.NAMESPACE)
                .build()

            constraintAttribute = typeBuilder.stringAttribute("constraint")
                .namespace(CustomBpmn.NAMESPACE)
                .build()

            valueAttribute = typeBuilder.stringAttribute("value")
                .namespace(CustomBpmn.NAMESPACE)
                .build()

            typeBuilder.build()
        }
    }
}