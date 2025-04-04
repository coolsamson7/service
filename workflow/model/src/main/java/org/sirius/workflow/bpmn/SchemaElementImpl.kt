package org.sirius.workflow.bpmn


import org.camunda.bpm.model.xml.ModelBuilder
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl
import org.camunda.bpm.model.xml.impl.instance.ModelTypeInstanceContext
import org.camunda.bpm.model.xml.type.attribute.Attribute
import org.camunda.bpm.model.xml.type.child.ChildElementCollection


class SchemaElementImpl(instanceContext: ModelTypeInstanceContext?) : ModelElementInstanceImpl(instanceContext),
    SchemaElement {

    override val name: String
        get() = nameAttribute.getValue(this) ?: ""

    override val properties: Collection<SchemaPropertyElement>
        get() = propertiesAttribute.get(this)

    // companion

    companion object {
        const val ELEMENT: String = "schema"

        protected lateinit var nameAttribute: Attribute<String>
        protected lateinit var propertiesAttribute: ChildElementCollection<SchemaPropertyElement>

        fun registerType(modelBuilder: ModelBuilder) {
            // declare a new element type

            val typeBuilder =
                modelBuilder
                    .defineType(SchemaElement::class.java, ELEMENT)
                    .namespaceUri(CustomBpmn.NAMESPACE)
                    .instanceProvider<SchemaElement> { instanceContext ->
                        SchemaElementImpl(instanceContext)
                    }

            // declare attributes

            nameAttribute = typeBuilder.stringAttribute("name")
                .namespace(CustomBpmn.NAMESPACE)
                .build()

            propertiesAttribute =
                typeBuilder
                    .sequence().elementCollection(SchemaPropertyElement::class.java)
                    .build()

            typeBuilder.build()
        }
    }
}