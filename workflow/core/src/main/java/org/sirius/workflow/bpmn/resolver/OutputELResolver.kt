package org.sirius.workflow.bpmn.resolver

import org.camunda.bpm.engine.delegate.VariableScope
import org.camunda.bpm.engine.impl.javax.el.ELContext
import org.camunda.bpm.engine.impl.javax.el.ELResolver
import org.camunda.bpm.engine.impl.persistence.entity.ExecutionEntity

import org.camunda.spin.json.SpinJsonNode
import java.beans.FeatureDescriptor


class OutputELResolver() : ELResolver() {
    // override

    override fun getValue(context: ELContext, base: Any?, property: Any): Any? {
        val `object` = context.getContext(VariableScope::class.java)
        if (`object` != null) {
            val variableScope = `object` as ExecutionEntity
            if (base == null) {
                val variable = property as String // according to javadoc, can only be a String

                if (property == "output") {
                    if (variableScope.hasVariable(variable)) {
                        context.isPropertyResolved = true

                        return OutputNode(variableScope.bpmnModelInstance, null, variableScope.getVariable(variable) as SpinJsonNode)
                    }
                } // if
            } // if
        }

        return null
    }

    override fun isReadOnly(context: ELContext, base: Any?, property: Any): Boolean {
        // TODO
        if (base == null) {
            val variable = property as String
            val `object` = context.getContext(VariableScope::class.java)
            return `object` != null && !(`object` as VariableScope).hasVariable(variable)
        }
        return true
    }

    override fun setValue(context: ELContext, base: Any?, property: Any, value: Any) {
        // TODO
        if (base == null) {
            val variable = property as String
            val `object` = context.getContext(VariableScope::class.java)
            if (`object` != null) {
                val variableScope = `object` as VariableScope
                if (variableScope.hasVariable(variable)) {
                    variableScope.setVariable(variable, value)
                    context.isPropertyResolved = true
                }
            }
        }
    }

    override fun getCommonPropertyType(arg0: ELContext, arg1: Any): Class<*> {
        return Any::class.java
    }

    override fun getFeatureDescriptors(arg0: ELContext, arg1: Any): Iterator<FeatureDescriptor>? {
        return null
    }

    override fun getType(arg0: ELContext, arg1: Any, arg2: Any): Class<*> {
        return Any::class.java
    }
}