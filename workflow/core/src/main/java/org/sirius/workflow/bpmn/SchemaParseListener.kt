package org.sirius.workflow.bpmn

import org.camunda.bpm.engine.delegate.DelegateExecution
import org.camunda.bpm.engine.delegate.ExecutionListener
import org.camunda.bpm.engine.impl.bpmn.parser.AbstractBpmnParseListener
import org.camunda.bpm.engine.impl.persistence.entity.ProcessDefinitionEntity
import org.camunda.bpm.engine.impl.pvm.process.ActivityImpl
import org.camunda.bpm.engine.impl.pvm.process.ScopeImpl
import org.camunda.bpm.engine.impl.util.xml.Attribute
import org.camunda.bpm.engine.impl.util.xml.Element
import org.camunda.bpm.engine.variable.Variables
import org.camunda.bpm.engine.variable.Variables.SerializationDataFormats
import org.camunda.bpm.engine.variable.value.ObjectValue
import org.camunda.spin.impl.json.jackson.JacksonJsonNode
import org.camunda.spin.plugin.variable.SpinValues
import org.camunda.spin.plugin.variable.value.JsonValue
import org.camunda.spin.plugin.variable.value.impl.JsonValueImpl
import java.lang.reflect.Field
import java.util.*
import kotlin.collections.HashMap

class Variable(val name: String, val type: String, val value: String)

class SchemaParseListener : AbstractBpmnParseListener() {

    override fun parseServiceTask(taskElement: Element, scope: ScopeImpl, activity: ActivityImpl) {
        val attributes  = getAttributeMap(taskElement)

        if ( attributes.containsKey("http://camunda.org/schema/1.0/bpmn:class")) {
            val implementation = attributes["http://camunda.org/schema/1.0/bpmn:class"]?.value

            attributes.put("expression", Attribute("expression", "\${${implementation}.execute(execution)}"))

            attributes.remove("http://camunda.org/schema/1.0/bpmn:class")
        }

        val extensions = taskElement.elements("extensionElements")

        if (!extensions.isEmpty()) {
            val inputOutput = extensions[0].elements("inputOutput")

            if ( !inputOutput.isEmpty()) {
                val inputParameter =  inputOutput[0]

                val inputs = inputParameter.elements("inputParameter")

                for ( input in inputs) {
                    val builder = getText(input)

                    if ( builder.startsWith("process:")) {
                        val variable = builder.toString().substring("process:".length)

                        builder.clear().append("\${execution.getVariable(\"${variable}\")}")
                    }

                    else if ( builder.startsWith("output:")) {
                        val variable = builder.toString().substring("output:".length)

                        val expression = StringBuilder()

                        expression
                            .append("\${")
                            .append("S(output)")

                        val tokenizer = StringTokenizer(variable, ".")
                        var more = tokenizer.hasMoreTokens()
                        while ( more ) {
                            val next = tokenizer.nextToken()

                            expression
                                .append(".prop(\"")
                                .append(next)
                                .append("\")")

                            more = tokenizer.hasMoreTokens()
                        }

                        expression
                            .append(".stringValue()")
                            .append("}")

                        builder.clear().append(expression.toString())
                    }

                    else println("### unknown input parameter type for " + builder)
                }
            }
        }
    }

    override fun parseProcess(processElement: Element, processDefinition: ProcessDefinitionEntity) {
        val extensions = processElement.elements("extensionElements")

        val variables = LinkedList<Variable>()
        if ( extensions.size > 0) {
            val schemas = extensions[0].elements("schema")

            for ( schema in schemas) {
                variables.add(
                    Variable(
                    schema.attribute("name"),
                    schema.attribute("type"),
                    schema.attribute("value")
                )
                )
            }
        }

        val listener = object: ExecutionListener {
            override fun notify(execution: DelegateExecution) {
                // the output object

                val value = SpinValues.jsonValue("{}").create()

                execution.setVariable("output", value)

                // set global variables

                for ( variable in variables)
                    execution.setVariable(variable.name, variable.value)
            }
        }

        processDefinition.addExecutionListener(ExecutionListener.EVENTNAME_START, listener)
    }

    companion object {
        private fun fetchField(clazz: Class<Element>, name: String) : Field {
            val field = clazz.getDeclaredField(name)

            field.isAccessible = true

            return field
        }

        val attributeMap = fetchField(Element::class.java,"attributeMap")
        val text =  fetchField(Element::class.java,"text")

        fun getAttributeMap(element: Element) :  MutableMap<String, Attribute> {
            return attributeMap.get(element) as  MutableMap<String, Attribute>
        }

        fun getText(element: Element) :  StringBuilder {
            return text.get(element) as StringBuilder
        }
    }
}