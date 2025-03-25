package org.sirius.workflow.bpmn.resolver

import org.camunda.bpm.model.bpmn.BpmnModelInstance
import org.camunda.bpm.model.bpmn.instance.ExtensionElements
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaInputOutput
import org.camunda.spin.json.SpinJsonNode
import org.sirius.workflow.bpmn.OutputParameter


class OutputNode(val instance: BpmnModelInstance, val task : org.camunda.bpm.model.bpmn.instance.ServiceTask?, val value: SpinJsonNode) {
    fun findTask(name: String) : org.camunda.bpm.model.bpmn.instance.ServiceTask? {
        val serviceTasks = instance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.ServiceTask::class.java)

        return serviceTasks.first { task -> task.name == name }
    }

    fun findOutput(name: String) : OutputParameter? {
        val extensions = task!!.getChildElementsByType(ExtensionElements::class.java)
        if ( extensions.isNotEmpty()) {
            val inputOutputs = extensions.first().getChildElementsByType(CamundaInputOutput::class.java)

            if ( inputOutputs.isNotEmpty()) {
                return inputOutputs.first().getChildElementsByType(OutputParameter::class.java).find {
                    output -> output.camundaName == name
                }

            }
        }

        return null
    }

    fun value(property: String) : Any? {
        if ( task == null) {
            val task = this.findTask(property)!!

            return OutputNode(instance, task, value.prop(property))
        }
        else {
            val output = this.findOutput(property)!!

            return when ( output.type ) {
                "String" -> this.value.prop(property).stringValue()
                "Boolean" -> this.value.prop(property).boolValue()
                "Short" -> this.value.prop(property).numberValue().toShort()
                "Integer" -> this.value.prop(property).numberValue().toInt()
                "Long" -> this.value.prop(property).numberValue().toLong()
                "Double" -> this.value.prop(property).numberValue().toDouble()
                else -> null
            }
        }
    }

    fun type(property: String) : Class<*> {
        if ( task === null)
            return OutputNode::class.java

        else {
            val output = findOutput(property)

            return when ( output!!.type ) {
                "String" -> String::class.java
                "Boolean" -> Boolean::class.java
                "Short" -> Short::class.java
                "Integer" -> Int::class.java
                "Long" -> Long::class.java
                "Double" -> Double::class.java
                else -> throw Error("should not happen")
            }
        }
    }
}