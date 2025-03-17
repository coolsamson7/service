package org.sirius.workflow

import org.camunda.bpm.model.bpmn.instance.Activity
import org.springframework.beans.factory.config.BeanDefinition
import java.lang.Error
import java.lang.reflect.Field
import java.util.*

class ParameterDescriptor(val field: Field, val name: String, val type: Class<*>, val description: String)

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
        try {
            field.set(serviceTask, serviceTask.getVariable<Any>(name))
        }
        catch(e: Error) {
            print("### tried to set a field of type " + field.type.name + " to a " +  serviceTask.getVariable<Any>(name).javaClass.name)
            println()
        }
    }
}

class OutputValue(val descriptor: ParameterDescriptor, val field: Field) {
    fun get(instance: Any) : Any {
        return this.field.get(instance)
    }
}


class ServiceTaskDescriptor<T:AbstractServiceTask>(name: String, description: String, clazz : Class<T>, bean: BeanDefinition, val inputs : Array<ParameterDescriptor>, val outputs : Array<ParameterDescriptor>)
    : Descriptor<T>(name, description, clazz, bean) {
    // instance data

    private val initializer = LinkedList<Initializer>()
    val outputValues = LinkedList<OutputValue>()

    // init

    init {
        initializer.add(DescriptorInitializer(this))

        for ( input in inputs)
             initializer.add(InputInitializer(input.field, input.name))

        for ( output in outputs)
            outputValues.add(OutputValue(output, output.field))
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