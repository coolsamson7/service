package com.serious.exception
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.NotNull
import org.junit.jupiter.api.Test
import org.springframework.lang.Nullable
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import java.lang.reflect.*
import java.util.*
import kotlin.collections.ArrayDeque
import kotlin.collections.ArrayList
import kotlin.reflect.*
import kotlin.reflect.full.declaredMembers
import kotlin.reflect.full.functions
import kotlin.reflect.full.memberProperties

data class TypeDescriptor(
    val name: String,
    val parameter: List<TypeDescriptor>
)

data class AnnotationDescriptor (
    val name: String,
    val parameters: List<ParameterValueDescriptor>
)
data class ParameterDescriptor(
    val name: String,
    val type: TypeDescriptor,
    val annotations: List<AnnotationDescriptor>
)

data class ParameterValueDescriptor(
    val name: String,
    val type: TypeDescriptor,
    val value: Any?
)
data class MethodDescriptor(
    val name: String,
    val returnType: TypeDescriptor,
    val annotations: List<AnnotationDescriptor>,
    val parameters: List<ParameterDescriptor>
)

data class PropertyDescriptor(
    val name: String,
    val type: TypeDescriptor,
    val annotations: List<AnnotationDescriptor>
)

data class InterfaceDescriptor(
    val name: String,
    val annotations: List<AnnotationDescriptor>,
    val properties: List<PropertyDescriptor>,
    val methods: List<MethodDescriptor>
)
class InterfaceAnalyzer {
    val models: HashMap<String, InterfaceDescriptor> = HashMap()
    val services: HashMap<String, InterfaceDescriptor> = HashMap()

    val queue = ArrayDeque<KClass<*>>()

    fun checkType(type: KType) {
        val qualifiedName = type.toString()

        if ( !qualifiedName.startsWith("java.") && !qualifiedName.startsWith("kotlin.")) {
            //val bla : Class<*> = type.javaType

            val bla = type.classifier

            if ( bla is KClass<*> ) {
                if ( !models.containsKey(bla.qualifiedName))
                    queue.add(bla)
            }
        }
    }

    fun finalize() {
        while (!queue.isEmpty())
            analyzeModel(queue.removeFirst())
    }

    // private

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
                type.toString(),
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
            if ( different && value!!.javaClass.isArray) {
                if (java.lang.reflect.Array.getLength(value) == java.lang.reflect.Array.getLength(def)) {
                    different = false
                    for ( i in 0..java.lang.reflect.Array.getLength(value)-1)
                        if ( java.lang.reflect.Array.get(value, i) != java.lang.reflect.Array.get(def, i) )
                            different = true
                }
            }

            if ( different) {
                println("" + method.name + " = " + value)

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
        return method.parameters.map { parameter ->
            ParameterDescriptor(
                parameter.name ?:"",
                type(parameter.type),
                annotations(parameter))
        }.subList(0, method.parameters.size - 1)
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

    fun analyzeMethods(clazz: KClass<*>) :List<MethodDescriptor> {
        return clazz.functions.map { method ->
            MethodDescriptor(
                method.name,
                type(method.returnType),
                method.annotations.map { annotation -> annotation(annotation) },
                parameters(method)
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
           emptyList(),
           this.analyzeMethods(clazz)
       )

        services.put(clazz.qualifiedName!!, descriptor)

       return descriptor
   }
}


class TestHandler : ExceptionManager.Handler {
    // prexform

    fun prexform(e : Throwable) : Throwable {
        return e
    }
    fun prexform(e : UndeclaredThrowableException) : Throwable  {
        return ExceptionManager.proceed(e.undeclaredThrowable)
    }

    fun prexform(e : InvocationTargetException) : Throwable {
        return ExceptionManager.proceed(e.targetException)
    }

    // log

    fun log(e : Throwable) {
        println("log")
    }

    fun log(e : Exception) {
        ExceptionManager.proceed(e)
    }

    fun log(e : NullPointerException) {
        ExceptionManager.proceed(e)
    }
}

interface Bar {
    @get:NotNull
    val num : Integer
}
interface Foo {
    @get:NotNull
    val num : Integer
    val bar: Bar
}

@Component
interface Bla {
    @get:Min(1)
    @get:Max(2)
    val num : Integer
    @get:NotNull
    val str : String
    val foo : Foo

    @GetMapping("jjj")
    fun bar()
    @Throws(RuntimeException::class)
    fun foo(@RequestParam("bla") @Nullable i: Integer) : Foo

    @Throws(RuntimeException::class)
    fun bar(@RequestParam("bla") @Nullable i: Integer) : List<String>
}
class ExceptionTests {

    @Test
    fun testAnalyzer() {
        val interfaceAnalyzer = InterfaceAnalyzer()
        val descriptor = interfaceAnalyzer.analyzeService(Bla::class)

        interfaceAnalyzer.finalize()

        println()
    }
    @Test
    fun test() {
        val manager = ExceptionManager()

        manager.register(TestHandler())

        manager.handleException(UndeclaredThrowableException(NullPointerException()))
    }
}