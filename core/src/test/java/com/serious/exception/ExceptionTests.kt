package com.serious.exception
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import org.junit.jupiter.api.Test
import org.springframework.lang.Nullable
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import java.lang.reflect.*
import java.util.*
import kotlin.collections.ArrayList
import kotlin.reflect.*
import kotlin.reflect.full.declaredMembers
import kotlin.reflect.full.functions
import kotlin.reflect.jvm.javaType

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
data class InterfaceDescriptor(
    val name: String,
    val annotations: List<AnnotationDescriptor>,
    val methods: List<MethodDescriptor>
)
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
   fun analyze(clazz: KClass<*>) :InterfaceDescriptor {
       val descriptor = InterfaceDescriptor(
           clazz.qualifiedName!!,
           clazz.annotations.map { annotation -> annotation(annotation) },
           this.analyzeMethods(clazz))

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

@Component
interface Bla {
    @GetMapping("jjj")
    fun bar()
    @Throws(RuntimeException::class)
    fun foo(@RequestParam("bla") @Nullable i: Integer)

    @Throws(RuntimeException::class)
    fun bar(@RequestParam("bla") @Nullable i: Integer) : List<String>
}
class ExceptionTests {

    @Test
    fun testAnalyzer() {
        val descriptor = InterfaceAnalyzer().analyze(Bla::class)

        println()
    }
    @Test
    fun test() {
        val manager = ExceptionManager()

        manager.register(TestHandler())

        manager.handleException(UndeclaredThrowableException(NullPointerException()))
    }
}