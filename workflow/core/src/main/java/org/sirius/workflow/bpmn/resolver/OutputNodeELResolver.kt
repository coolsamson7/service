package org.sirius.workflow.bpmn.resolver

import org.camunda.bpm.engine.impl.javax.el.ELContext
import org.camunda.bpm.engine.impl.javax.el.ELResolver
import java.beans.FeatureDescriptor


class OutputNodeELResolver() : ELResolver() {
    // override

    override fun getValue(context: ELContext, base: Any?, property: Any): Any? {
        if ( base !== null) {
            val outputs = base as OutputNode

            context.isPropertyResolved = true

            return outputs.value(property as String)
        }
        else return null
    }

    override fun isReadOnly(context: ELContext, base: Any?, property: Any): Boolean {
        return true
    }

    override fun setValue(context: ELContext, base: Any?, property: Any, value: Any) {

    }

    override fun getCommonPropertyType(arg0: ELContext, base: Any): Class<*> {
        return Any::class.java
    }

    override fun getFeatureDescriptors(arg0: ELContext, arg1: Any): Iterator<FeatureDescriptor>? {
        return null
    }

    override fun getType(arg0: ELContext, base: Any?, property: Any): Class<*> {
        if ( base == null )
            return OutputNode::class.java
        else {
            val node = base as OutputNode

            return node.type(property as String)
        }
    }
}
