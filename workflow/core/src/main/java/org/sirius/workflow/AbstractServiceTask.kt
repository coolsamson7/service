package org.sirius.workflow

import org.camunda.bpm.engine.delegate.DelegateExecution
import org.camunda.bpm.engine.delegate.JavaDelegate
import org.camunda.bpm.model.bpmn.instance.Activity
import org.camunda.spin.json.SpinJsonNode
import java.util.*

@Target(
    AnnotationTarget.PROPERTY_GETTER,
    AnnotationTarget.PROPERTY_SETTER,
    AnnotationTarget.FIELD
)
@Retention(
    AnnotationRetention.RUNTIME
)
@MustBeDocumented
annotation class Input(val value: String = "")

@Target(
    AnnotationTarget.PROPERTY_GETTER,
    AnnotationTarget.PROPERTY_SETTER,
    AnnotationTarget.FIELD
)
@Retention(
    AnnotationRetention.RUNTIME
)
@MustBeDocumented
annotation class Output(val value: String = "")

abstract class AbstractServiceTask : JavaDelegate {
    // instance data

    lateinit var descriptor : ServiceTaskDescriptor<AbstractServiceTask>

    // protected

    fun execution() : DelegateExecution {
        return SpringTaskDelegate.context.get().execution
    }

    fun collectOutput() {
        // retrieve variable

        val name = this.execution().currentActivityName
        val output = execution().getVariable("output") as SpinJsonNode
        var node = output

        if ( !node.hasProp(name))
            node.prop(name, HashMap())

        node = node.prop(name)

        // set values

        for ( outputValue in descriptor.outputValues) {
            val name = outputValue.descriptor.name
            val value = outputValue.field.get(this)

            when (outputValue.descriptor.type) {
                String::class.java -> node.prop(name, value as String)
                Boolean::class.java -> node.prop(name, value as Boolean)
                //String::class.java -> node.prop(name, value as String)

                else -> {
                    throw RuntimeException("bad type")
                }
            }
        }

        // write

        execution().setVariable("output", output)
    }

    fun setOutput(variable: String, value: String) {
        // TODO: check

        val outputParameter = this.descriptor.output(variable)

        val name = this.execution().currentActivityName + "." + variable // TODO
        var output =  execution().getVariable("output") as SpinJsonNode
        var node = output

        val tokenizer = StringTokenizer(name, ".")
        var more = tokenizer.hasMoreTokens()
        while ( more) {
            val property = tokenizer.nextToken()

            more = tokenizer.hasMoreTokens()

            if (more) {
                // middle node

                if (!node.hasProp(property))
                    node.prop(property, HashMap())

                node = node.prop(property)
            }
            else {
                // last node
                node.prop(property, value)
            }
        } // while

        // TODO collect first....

        execution().setVariable("output", output)
    }

    fun getOutput(name: String) : String {
        var node = execution().getVariable("output") as SpinJsonNode

        val tokenizer = StringTokenizer(name, ".")
        while ( tokenizer.hasMoreTokens()) {
            val next = tokenizer.nextToken()

            node = node.prop(next)
        }

        return node.stringValue()
    }

    fun <T> getVariable(name: String) : T {
        return execution().getVariable(name) as T // TODO...ich muss wissen, was es ist...prozess, input, etc. + type check
    }

    // abstract

    abstract fun run()

    // override

    override fun execute(execution: DelegateExecution) {
        this.descriptor.setElement(execution.getBpmnModelElementInstance() as Activity)

        try {
            run()
        }
        finally {
            collectOutput();
        }
    }
}