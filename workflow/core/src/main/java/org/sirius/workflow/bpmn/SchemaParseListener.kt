package org.sirius.workflow.bpmn

import org.camunda.bpm.engine.delegate.ExecutionListener
import org.camunda.bpm.engine.impl.bpmn.parser.AbstractBpmnParseListener
import org.camunda.bpm.engine.impl.persistence.entity.ProcessDefinitionEntity
import org.camunda.bpm.engine.impl.pvm.process.ActivityImpl
import org.camunda.bpm.engine.impl.pvm.process.ScopeImpl
import org.camunda.bpm.engine.impl.util.xml.Attribute
import org.camunda.bpm.engine.impl.util.xml.Element
import org.camunda.spin.plugin.variable.SpinValues
import java.lang.reflect.Field
import java.util.*

class Variable(val name: String, val type: String, val value: Any)

class SchemaParseListener : AbstractBpmnParseListener() {
    // private

    private val outputTypes = HashMap<String,String>()

    private val pending = HashMap<String,LinkedList<StringBuilder>>()

    private fun addPending(input: String, builder: StringBuilder) {
        if ( !this.pending.containsKey(input))
            this.pending[input] = LinkedList<StringBuilder>()

        this.pending[input]!!.add(builder)
    }

    private fun rememberOutput(output: String, type: String) {
        outputTypes[output] = type

        if ( this.pending.containsKey(output)) {
            for (pending in this.pending.get(output)!!) {
                when ( type ) {
                    "String" -> pending.append(".stringValue()")
                    "Boolean" -> pending.append(".boolValue()")
                    "Short" -> pending.append(".numberValue()")
                    "Integer" -> pending.append(".numberValue()")
                    "Long" -> pending.append(".numberValue()")
                    "Double" -> pending.append(".numberValue()")
                }

                pending.append("}")
            }

            this.pending.clear()
        }
    }

    private fun rememberOutputs(taskElement: Element) {
        val extensions = taskElement.elements("extensionElements")

        val taskName = taskElement.attribute("name")

        if (extensions.isNotEmpty()) {
            val inputOutputs = extensions[0].elements("inputOutput")

            if (inputOutputs.isNotEmpty()) {
                val inputOutputParameter = inputOutputs[0]

                val outputs = inputOutputParameter.elements("outputParameter")

                for (output in outputs) {
                    val name = output.attribute("name")
                    val type = output.attribute("type")

                    rememberOutput("$taskName.$name", type)
                } // for
            }
        }
    }

    private fun patchInputs(taskElement: Element) {
        val uri = fetchField(Element::class.java, "uri")

        val extensions = taskElement.elements("extensionElements")

        if (extensions.isNotEmpty()) {
            val inputOutputs = extensions[0].elements("inputOutput")

            if (inputOutputs.isNotEmpty()) {
                val inputOutputParameter = inputOutputs[0]

                val inputs = inputOutputParameter.elements("inputParameter")

                for (input in inputs) {
                    uri.set(input, CAMUNDA_NS ) // :-)

                    val builder = getText(input)

                    val source = input.attribute("source")

                    // process

                    if (source == "process") {
                        val variable = builder.toString()

                        builder.clear().append("\${execution.getVariable(\"${variable}\")}")
                    }

                    else if (source == "value") {
                        val variable = builder.toString()
                        val type = input.attribute("type")

                        builder.clear().append("\${types.convert2(\"$variable\", \"$type\")}")
                    }

                    // output

                    else if (source == "output") {
                        val variable = builder.toString()

                        val expression = StringBuilder()

                        expression
                            .append("\${")
                            .append("S(output)")

                        val tokenizer = StringTokenizer(variable, ".")
                        var more = tokenizer.hasMoreTokens()
                        while (more) {
                            val next = tokenizer.nextToken()

                            expression
                                .append(".prop(\"")
                                .append(next)
                                .append("\")")

                            more = tokenizer.hasMoreTokens()
                        }

                        if (outputTypes.containsKey(variable)) {
                            val type = outputTypes[variable]

                            when ( type ) {
                                "String" -> expression.append(".stringValue()")
                                "Boolean" -> expression.append(".boolValue()")
                                "Short" -> expression.append(".numberValue()")
                                "Integer" -> expression.append(".numberValue()")
                                "Long" -> expression.append(".numberValue()")
                                "Double" -> expression.append(".numberValue()")
                            }

                            expression.append("}")
                        }
                        else {
                            addPending(variable, builder)
                        }

                        builder.clear().append(expression.toString())
                    }
                    else println("### unknown input parameter type for " + builder)
                } // for
            } // if
        }
    }

    // override AbstractBpmnParseListener

    override fun parseUserTask(userTaskElement: Element, scope: ScopeImpl, activity: ActivityImpl) {
        this.rememberOutputs(userTaskElement)
        this.patchInputs(userTaskElement)
    }

    override fun parseServiceTask(taskElement: Element, scope: ScopeImpl, activity: ActivityImpl) {
        this.rememberOutputs(taskElement)

        val attributes  = getAttributeMap(taskElement)

        if ( attributes.containsKey(CAMUNDA_NS + ":class")) {
            val implementation = attributes[CAMUNDA_NS + ":class"]?.value

            attributes.put("expression", Attribute("expression", "\${${implementation}.execute(execution)}"))

            attributes.remove(CAMUNDA_NS + ":class")
        }

        this.patchInputs(taskElement)
    }

    override fun parseProcess(processElement: Element, processDefinition: ProcessDefinitionEntity) {
        val extensions = processElement.elements("extensionElements")

        val variables = LinkedList<Variable>()
        if ( extensions.size > 0) {
            val schemas = extensions[0].elements("schema")

            for ( schema in schemas) {
                for ( property in schema.elements()) {
                    val type = property.attribute("type")
                    val stringValue = property.attribute("value")
                    var value : Any = stringValue

                    value = when (type) {
                        "Short" -> java.lang.Short.valueOf(stringValue)
                        "Integer" -> java.lang.Integer.valueOf(stringValue)
                        "Long" -> java.lang.Long.valueOf(stringValue)
                        "Double" -> java.lang.Double.valueOf(stringValue)
                        "Boolean" -> java.lang.Boolean.valueOf(value == "true")
                        else -> value
                    }

                    variables.add(Variable(property.attribute("name"), type, value))
                }
            }
        }

        val listener = ExecutionListener { execution ->
            val value = SpinValues.jsonValue("{}").create()

            execution.setVariable("output", value)

            // set global variables

            for ( variable in variables) {
                execution.setVariable(variable.name, variable.value)
            }
        }

        processDefinition.addExecutionListener(ExecutionListener.EVENTNAME_START, listener)
    }

    companion object {
        const val CAMUNDA_NS = "http://camunda.org/schema/1.0/bpmn"
        private fun fetchField(clazz: Class<Element>, name: String) : Field {
            val field = clazz.getDeclaredField(name)

            field.isAccessible = true

            return field
        }

        private val attributeMap = fetchField(Element::class.java,"attributeMap")
        private val text =  fetchField(Element::class.java,"text")

        fun getAttributeMap(element: Element) :  MutableMap<String, Attribute> {
            return attributeMap.get(element) as  MutableMap<String, Attribute>
        }

        fun getText(element: Element) :  StringBuilder {
            return text.get(element) as StringBuilder
        }
    }
}