package com.serious.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable
import kotlin.reflect.*
import kotlin.reflect.full.declaredFunctions
import kotlin.reflect.full.declaredMembers

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
data class MethodDescriptor(
    val name: String,
    val returnType: TypeDescriptor,
    val parameters: List<ParameterDescriptor>,
    val annotations: List<AnnotationDescriptor>
): Serializable
data class InterfaceDescriptor(
    val name: String,
    val annotations: List<AnnotationDescriptor>,
    val methods: List<MethodDescriptor>
): Serializable
class InterfaceAnalyzer {
    // private

    fun type(type: KType) : TypeDescriptor {
        return TypeDescriptor(
            type.toString(),
            type.arguments.map { param -> type(param.type!!) }
        )
    }

    fun annotation(annotation: Annotation) :AnnotationDescriptor {
        val values = ArrayList<ParameterValueDescriptor>()
        for ( method in annotation.annotationClass.declaredMembers) {
            val def = annotation.annotationClass.java.getMethod(method.name).defaultValue//method.defaultValue
            val value = method.call(annotation)

            var different = def != value
            if ( different && value!!.javaClass.isArray) {
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

    // public
    fun analyze(clazz: KClass<*>) :InterfaceDescriptor {
        val descriptor = InterfaceDescriptor(
            clazz.qualifiedName!!,
            clazz.annotations.map { annotation -> annotation(annotation) },
            this.analyzeMethods(clazz))

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
    @JvmField
    var interfaceDescriptor : InterfaceDescriptor? = null

    // constructor
    init {
        val annotation = this.serviceInterface.getAnnotation(ServiceInterface::class.java)
        if (!annotation.name.isBlank()) name = annotation.name
        if (!annotation.description.isBlank()) description = annotation.description
        this.componentDescriptor = componentDescriptor
    }

    fun getInterfaceDescriptor() : InterfaceDescriptor {
       if ( interfaceDescriptor == null)
           interfaceDescriptor = InterfaceAnalyzer().analyze(serviceInterface.kotlin)

        return interfaceDescriptor!!
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