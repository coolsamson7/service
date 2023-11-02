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
import kotlin.reflect.full.*
import kotlin.reflect.jvm.javaField

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
    val kind: String, // for now
    val inherits: String?,
    val implements: List<String>,
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
    val checked = HashSet<KClass<*>>()

    val ignore = arrayOf("java.", "kotlin.", "reactor.")

    // private

    private fun checkClass(clazz: KClass<*>?) :KClass<*>? {
        if ( clazz != null ) {
            val qualifiedName = clazz.qualifiedName ?: ""

            // ignore known types

            for (prefix in ignore)
                if (qualifiedName.startsWith(prefix))
                    return clazz

            if (!checked.contains(clazz) && !queue.contains(clazz))
                queue.add(clazz)
        }

        return clazz;
    }

    private fun checkType(type: KType) {
        val qualifiedName = type.toString()

        // ignore known types

        for ( prefix in ignore)
            if (qualifiedName.startsWith(prefix))
                return

        // ignore base types

        val clazz = type.classifier

        if ( clazz is KClass<*> ) {
            if ( clazz != Service::class)
            if ( !checked.contains(clazz) && !queue.contains(clazz))
                queue.add(clazz)
        }
    }

    fun modelFor(componentDescriptor: ComponentDescriptor<*>) :ComponentModel {
        // component

        component = analyzeComponent(componentDescriptor.serviceInterface.kotlin)

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
        val params = method.parameters
            .filter { param -> param.kind != KParameter.Kind.INSTANCE }
            .map { parameter ->
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
            var annotations : List<AnnotationDescriptor> = ArrayList<AnnotationDescriptor>()

            // field

            if ( property.javaField != null)
                annotations = property.javaField!!.annotations.map { annotation -> annotation(annotation) }
            else if (property.getter != null)
                annotations = property.getter!!.annotations.map { annotation -> annotation(annotation) }
            else
                annotations = property.annotations.map { annotation -> annotation(annotation) }

            PropertyDescriptor(
                property.name,
                type(property.returnType),
                annotations
            )}
    }

    // public

    fun analyzeModel(clazz: KClass<*>) :InterfaceDescriptor {
        checked.add(clazz)

        val descriptor = InterfaceDescriptor(
            clazz.qualifiedName!!,
            kind(clazz),
            superclass(clazz)?.qualifiedName,
            implements(clazz).map { clazz -> clazz.qualifiedName!! },
            clazz.annotations.map { annotation -> annotation(annotation) },
            this.analyzeProperties(clazz),
            emptyList()
        )

        models.put(clazz.qualifiedName!!, descriptor)

        return descriptor
    }

    fun kind(clazz: KClass<*>) : String {
        val builder = StringBuilder()

        if ( clazz.isAbstract)
            builder.append("abstract")

        if ( clazz.isData)
            builder.append(" data")

        if ( clazz.java.isInterface)
            builder.append(" interface")
        else
            builder.append(" class")

        return builder.toString()
    }

    fun superclass(clazz: KClass<*>) : KClass<*>? {
        val result = clazz.superclasses
            .find { superClass -> !superClass.java.isInterface && !superClass.qualifiedName!!.startsWith("kotlin.Any") }

        checkClass(result)

        return result
    }

    fun implements(clazz: KClass<*>) : List<KClass<*>> {
        return clazz.superclasses
            .filter { superClass -> superClass.java.isInterface }
            .map { superClass -> checkClass(superClass)!! }
    }

    fun analyzeService(clazz: KClass<*>) :InterfaceDescriptor {
        checked.add(clazz) // ((clazz.supertypes[0].javaType) as Class<*>).isInterface

        val descriptor = InterfaceDescriptor(
            clazz.qualifiedName!!,
            kind(clazz),
            superclass(clazz)?.qualifiedName,
            implements(clazz).map { clazz -> clazz.qualifiedName!! },
            clazz.annotations.map { annotation -> annotation(annotation) },
            emptyList(),//this.analyzeProperties(clazz)
            this.analyzeMethods(clazz))

        if ( !clazz.isSubclassOf(Component::class))
            services.put(clazz.qualifiedName!!, descriptor)

        return descriptor
    }

    fun analyzeComponent(clazz: KClass<*>) :InterfaceDescriptor {
        checked.add(clazz)

        val descriptor = InterfaceDescriptor(
            clazz.qualifiedName!!,
            kind(clazz),
            superclass(clazz)?.qualifiedName,
            implements(clazz).map { clazz -> clazz.qualifiedName!! },
            clazz.annotations.map { annotation -> annotation(annotation) },
            this.analyzeProperties(clazz),
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