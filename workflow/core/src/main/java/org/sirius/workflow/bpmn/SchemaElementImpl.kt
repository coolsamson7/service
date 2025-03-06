package org.sirius.workflow.bpmn

import org.camunda.bpm.model.xml.ModelBuilder
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl
import org.camunda.bpm.model.xml.impl.instance.ModelTypeInstanceContext
import org.camunda.bpm.model.xml.type.attribute.Attribute


class SchemaElementImpl(instanceContext: ModelTypeInstanceContext?) : ModelElementInstanceImpl(instanceContext),
    SchemaElement {

    override val name: String
        get() = nameAttribute!!.getValue(this)

    override val type: String
        get() = typeAttribute!!.getValue(this)

    override val value: String
        get() = valueAttribute!!.getValue(this)

    // companion

    companion object {
        const val ELEMENT_SCHEMA: String = "schema"

        protected var nameAttribute: Attribute<String>? = null
        protected var typeAttribute: Attribute<String>? = null
        protected var valueAttribute: Attribute<String>? = null

        fun registerType(modelBuilder: ModelBuilder) {
            // declare a new element type

            val typeBuilder =
                modelBuilder
                    .defineType(SchemaElement::class.java, ELEMENT_SCHEMA)
                    .namespaceUri(CustomBpmn.CUSTOM_NAMESPACE)
                    .instanceProvider<SchemaElement> { instanceContext ->
                        SchemaElementImpl(instanceContext)
                    }

            // declare attributes

            nameAttribute = typeBuilder.stringAttribute("name")
                .namespace(CustomBpmn.CUSTOM_NAMESPACE)
                .build()

            typeAttribute = typeBuilder.stringAttribute("type")
                .namespace(CustomBpmn.CUSTOM_NAMESPACE)
                .build()

            valueAttribute = typeBuilder.stringAttribute("value")
                .namespace(CustomBpmn.CUSTOM_NAMESPACE)
                .build()

            typeBuilder.build()
        }
    }
}