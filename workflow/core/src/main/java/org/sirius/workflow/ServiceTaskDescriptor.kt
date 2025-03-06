package org.sirius.workflow

import org.camunda.bpm.model.bpmn.instance.Activity
import org.springframework.beans.factory.config.BeanDefinition
import java.lang.reflect.Field
import java.util.*

class ParameterDescriptor(val name: String, val type: Class<*>, val description: String)

interface Initializer {
    fun initialize(serviceTask: AbstractServiceTask)
}

class DescriptorInitializer<T: AbstractServiceTask>(val descriptor: ServiceTaskDescriptor<T>) : Initializer {
    // implement

    override fun initialize(serviceTask: AbstractServiceTask) {
        serviceTask.descriptor = descriptor as ServiceTaskDescriptor<AbstractServiceTask>
    }
}

class InputInitializer(val field: Field, val name: String) : Initializer {
    // implement

    override fun initialize(serviceTask: AbstractServiceTask) {
        field.set(serviceTask,  serviceTask.getVariable<Any>(name))
    }
}

class OutputValue(val descriptor: ParameterDescriptor, val field: Field) {

}


class ServiceTaskDescriptor<T:AbstractServiceTask>(name: String, description: String, clazz : Class<T>, bean: BeanDefinition, val inputs : Array<ParameterDescriptor>, val outputs : Array<ParameterDescriptor>)
    : Descriptor<T>(name, description, clazz, bean) {
    // instance data

    private val initializer = LinkedList<Initializer>()
    val outputValues = LinkedList<OutputValue>()

    // init

    init {
        initializer.add(DescriptorInitializer(this))

        for ( field in clazz.declaredFields) {
            // find inputs

            val inputs = field.getAnnotationsByType(Input::class.java)
            if ( inputs.size == 1) {
                val input = inputs[0]

                val inputDescriptor = input(if ( input.value.isEmpty()) field.name else input.value)

                if ( field.type.isAssignableFrom(inputDescriptor.type))
                    initializer.add(InputInitializer(field, inputDescriptor.name))
                else
                    throw RuntimeException("input ${inputDescriptor.name} expected to be a ${inputDescriptor.type}") // TODO
            } // if

            // outputs

            val outputs = field.getAnnotationsByType(Output::class.java)
            if ( outputs.size == 1) {
                val output = outputs[0]

                val descriptor = output(if ( output.value.isEmpty()) field.name else output.value)

                if ( !descriptor.type.isAssignableFrom(field.type))
                    throw RuntimeException("type mismatch in output")

                field.isAccessible = true

                this.outputValues.add(OutputValue(descriptor, field))
            } // if
        } // for

        // anything missing

        if ( outputValues.size < outputs.size)
            throw RuntimeException("missing @Output")
    }

    // public

    fun input(name: String) : ParameterDescriptor {
        val input = inputs.find { input -> input.name == name }

        if ( input != null )
            return input
        else
            throw RuntimeException("unknown input $name")
    }

    fun output(name: String) : ParameterDescriptor {
        val output = outputs.find { output -> output.name == name }

        if ( output != null )
            return output
        else
            throw RuntimeException("unknown output $name")

    }

    fun initialize(serviceTask: AbstractServiceTask) {
        for ( initializer in this.initializer)
            initializer.initialize(serviceTask)
    }

    fun setElement(activity: Activity) {
        // TODO

        println(activity)
    }
}