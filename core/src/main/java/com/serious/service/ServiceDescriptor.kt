package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable
import kotlin.collections.ArrayDeque
import kotlin.collections.ArrayList
import kotlin.reflect.*
import kotlin.reflect.full.declaredFunctions
import kotlin.reflect.full.declaredMembers
import kotlin.reflect.full.isSubclassOf
import kotlin.reflect.full.memberProperties

data class TypeDescriptor(
    val name: String,
    val parameter: List<TypeDescriptor>
): Serializable
data class AnnotationDescriptor (
    val name: String,
    val parameters: List<ParameterValueDescriptor>
): Serializable
data class ParameterDescriptor(
    val name: String,
    val type: TypeDescriptor,
    val annotations: List<AnnotationDescriptor>
): Serializable

data class ParameterValueDescriptor(
    val name: String,
    val type: TypeDescriptor,
    val value: Any?
): Serializable

data class PropertyDescriptor(
    val name: String,
    val type: TypeDescriptor,
    val annotations: List<AnnotationDescriptor>
) : Serializable
data class MethodDescriptor(
    val name: String,
    val returnType: TypeDescriptor,
    val parameters: List<ParameterDescriptor>,
    val annotations: List<AnnotationDescriptor>
): Serializable
data class InterfaceDescriptor(
    val name: String,
    val annotations: List<AnnotationDescriptor>,
    val properties: List<PropertyDescriptor>,
    val methods: List<MethodDescriptor>
): Serializable

data class ComponentModel (
    val component: InterfaceDescriptor,
    val services: Collection<InterfaceDescriptor>,
    val models: Collection<InterfaceDescriptor>
): Serializable

class InterfaceAnalyzer {
    // instance data

    var component : InterfaceDescriptor? = null
    val models: java.util.HashMap<String, InterfaceDescriptor> = java.util.HashMap()
    val services: java.util.HashMap<String, InterfaceDescriptor> = java.util.HashMap()
    val queue = ArrayDeque<KClass<*>>()

    // private
    private fun checkType(type: KType) {
        val qualifiedName = type.toString()

        if ( !qualifiedName.startsWith("java.") && !qualifiedName.startsWith("kotlin.")) {
            val clazz = type.classifier

            if ( clazz is KClass<*> ) {
                if ( !models.containsKey(clazz.qualifiedName))
                    queue.add(clazz)
            }
        }
    }

    fun modelFor(componentDescriptor: ComponentDescriptor<*>) :ComponentModel {
        // component

        component = analyzeService(componentDescriptor.serviceInterface.kotlin)

        // services

        for ( service in componentDescriptor.services)
            analyzeService(service.serviceInterface.kotlin)

        // finish queue

        while (!queue.isEmpty())
            analyzeModel(queue.removeFirst())

        // done

        return ComponentModel(
            component!!,
            ArrayList(services.values),
            ArrayList(models.values)
        )
    }

    // functions
    fun type(type: KType) : TypeDescriptor {
        checkType(type)

        if (type.arguments.isEmpty())
            return TypeDescriptor(
                type.toString(),
                emptyList()
            )
        else {
            var name = type.toString();
            name = name.substring(0, name.indexOf("<"))
            return TypeDescriptor(
                name,
                type.arguments.map { param -> type(param.type!!) }
            )
        }
    }

    fun annotation(annotation: Annotation) :AnnotationDescriptor {
        val values = ArrayList<ParameterValueDescriptor>()
        for ( method in annotation.annotationClass.declaredMembers) {
            val def = annotation.annotationClass.java.getMethod(method.name).defaultValue//method.defaultValue
            val value = method.call(annotation)

            var different = def != value
            if ( different && def != null && value != null &&  value!!.javaClass.isArray) {
                if (java.lang.reflect.Array.getLength(value) == java.lang.reflect.Array.getLength(def)) {
                    different = false
                    for ( i in 0..java.lang.reflect.Array.getLength(value)-1)
                        if ( java.lang.reflect.Array.get(value, i) != java.lang.reflect.Array.get(def, i) )
                            different = true
                }
            }

            if ( different ) {
                values.add(ParameterValueDescriptor(
                    method.name,
                    type(method.returnType),
                    value
                ))
            }
        }

        return AnnotationDescriptor(
            annotation.annotationClass.simpleName!!,
            values
        )
    }

    fun annotations(parameter: KParameter) : List<AnnotationDescriptor> {
        return parameter.annotations.map { annotation -> annotation(annotation) }
    }
    fun parameters(method: KFunction<*>) :List<ParameterDescriptor> {
        val params = method.parameters.map { parameter ->
            ParameterDescriptor(
                parameter.name ?:"",
                type(parameter.type),
                annotations(parameter))
        }

        return params
    }

    fun analyzeMethods(clazz: KClass<*>) :List<MethodDescriptor> {
        return clazz.declaredFunctions.map { method ->
            MethodDescriptor(
                method.name,
                type(method.returnType),
                parameters(method),
                method.annotations.map { annotation -> annotation(annotation) }
            )}
    }

    fun analyzeProperties(clazz: KClass<*>) :List<PropertyDescriptor> {
        return clazz.memberProperties.map { property ->
            PropertyDescriptor(
                property.name,
                type(property.returnType),
                property.getter.annotations.map { annotation -> annotation(annotation) },
                //parameters(method)
            )}
    }

    // public

    fun analyzeModel(clazz: KClass<*>) :InterfaceDescriptor {
        val descriptor = InterfaceDescriptor(
            clazz.qualifiedName!!,
            clazz.annotations.map { annotation -> annotation(annotation) },
            this.analyzeProperties(clazz),
            emptyList()
        )

        models.put(clazz.qualifiedName!!, descriptor)

        return descriptor
    }
    fun analyzeService(clazz: KClass<*>) :InterfaceDescriptor {
        val descriptor = InterfaceDescriptor(
            clazz.qualifiedName!!,
            clazz.annotations.map { annotation -> annotation(annotation) },
            emptyList(),//this.analyzeProperties(clazz)
            this.analyzeMethods(clazz))

        if ( !clazz.isSubclassOf(Component::class))
            services.put(clazz.qualifiedName!!, descriptor)

        return descriptor
    }
}

/**
 * A <code>ServiceDescriptor</code> is a [BaseDescriptor] that takes care of [Service]s
 */
class ServiceDescriptor<T : Service>(
    componentDescriptor: ComponentDescriptor<Component>,
    serviceInterface: Class<T>
) : BaseDescriptor<T>(serviceInterface) {
    // instance data

    @JvmField
    val componentDescriptor: ComponentDescriptor<out Component>

    // constructor
    init {
        val annotation = this.serviceInterface.getAnnotation(ServiceInterface::class.java)
        if (!annotation.name.isBlank()) name = annotation.name
        if (!annotation.description.isBlank()) description = annotation.description
        this.componentDescriptor = componentDescriptor
    }

    override val isService: Boolean
        // override
        get() = true

    override fun getComponentDescriptor(): ComponentDescriptor<out Component> {
        return componentDescriptor
    }

    // public
    fun report(builder: StringBuilder) {
        builder
            .append("\t\t")
            .append(name)
        if (local != null) builder.append("[local]")
        builder.append("\n")
    }
}