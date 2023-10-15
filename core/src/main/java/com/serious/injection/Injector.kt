package com.serious.injection
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.collections.Arrays.add2
import com.serious.lang.Keywords
import org.springframework.beans.BeansException
import org.springframework.beans.factory.config.BeanPostProcessor
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Field
import java.lang.reflect.Method
import java.util.*
import kotlin.collections.ArrayList

/**
 * An `Injector` is responsible for the complete dependency injection of target
 * objects. Basically, it performs two tasks:
 *
 *  * It serves as a registry for [Injection]s.
 *  * It performs the injection of resources into a target object.
 */
class Injector(vararg injections: Injection<Annotation, Any>) : BeanPostProcessor {
    // local classes
    private class CachedInjector(val accessibleObject: AccessibleObject, val annotation: Annotation, val injection: Injection<Annotation, Any>)

    // instance data

    private val injections: MutableMap<Class<out Annotation>, Injection<Annotation, Any>> = LinkedHashMap()
    private var cachedFieldInjectors: MutableMap<Class<*>, Array<CachedInjector>> = IdentityHashMap()
    private var cachedMethodInjectors: MutableMap<Class<*>, Array<CachedInjector>> = IdentityHashMap()

    // constructor

     init {
         for (injection in injections)
             registerInjection(injection)
     }

    // public

    /**
     * Registers a dependency injector for the given annotation type. The manager will use this
     * injector for a given object if there are
     * fields in the object's class with annotation of this annotation type.
     *
     * @param injection the injector instance
     */
    @Synchronized
    fun registerInjection(injection: Injection<Annotation, Any>) {
        injections[injection.annotationClass] = injection
        cachedFieldInjectors.clear()
        cachedMethodInjectors.clear()
    }

    // public

    private fun computeFieldInjectors(clazz: Class<*>): Array<CachedInjector> {
        // When computing the cached injectors consider the order in which the injectors have been
        // registered

        val annotatedFields: MutableMap<Class<out Annotation>, Array<Field>> = IdentityHashMap()
        for (field in computeFields(clazz)) {
            for (annotation in field.getAnnotations()) {
                val annotationType: Class<out Annotation> = annotation.annotationClass.java

                var fieldsWithAnnotation = annotatedFields[annotationType]
                fieldsWithAnnotation = if (fieldsWithAnnotation == null) arrayOf(field) else add2(Field::class.java, fieldsWithAnnotation, field)
                annotatedFields[annotationType] = fieldsWithAnnotation
            } // for
        } // for

        // ... and then iterate over all registered injectors

        val cachedInjectors: MutableList<CachedInjector> = ArrayList()
        for ((annotationType, value) in injections) {
            val fieldsWithAnnotation = annotatedFields[annotationType]

            if (fieldsWithAnnotation != null) {
                for (field in fieldsWithAnnotation) {
                    val annotation = field.getAnnotation(annotationType)!!

                    field.trySetAccessible() // if false?
                    cachedInjectors.add(CachedInjector(field, annotation, value))
                }
            } // if
        } // for

        return cachedInjectors.toTypedArray<CachedInjector>()
    }

    private fun computeMethodInjectors(clazz: Class<*>): Array<CachedInjector> {
        // When computing the cached injectors consider the order in which the injectors have been registered

        val annotatedMethods: MutableMap<Class<out Annotation>, Array<Method>> = IdentityHashMap()
        for (method in computeMethods(clazz)) {
            for (annotation in method.annotations) {
                val annotationType: Class<out Annotation> = annotation::class.java

                var methodsWithAnnotation = annotatedMethods[annotationType]
                methodsWithAnnotation = if (methodsWithAnnotation == null) arrayOf(method) else add2(Method::class.java, methodsWithAnnotation, method)

                annotatedMethods[annotationType] = methodsWithAnnotation
            } // for
        } // for

        // ... and then iterate over all registered injectors

        val cachedInjectors: MutableList<CachedInjector> = ArrayList()
        for ((annotationType, value) in injections) {
            val methodsWithAnnotation = annotatedMethods[annotationType]
            if (methodsWithAnnotation != null) {
                for (method in methodsWithAnnotation) {
                    val annotation = method.getAnnotation(annotationType)!!

                    method.trySetAccessible() // if result is false?
                    cachedInjectors.add(CachedInjector(method, annotation, value))
                }
            } // if
        } // for

        return cachedInjectors.toTypedArray<CachedInjector>()
    }

    /**
     * Performs the dependency injection for the given target object.
     *
     * @param targetObject the target object
     * @param context      the context information; the caller of this method has to know which kind of
     * context is needed (it depends on the
     * needs of the injectors that have been registered by the caller)
     */
    fun inject(targetObject: Any, context: Any) {
        val fieldInjectors  = cachedFieldInjectors.computeIfAbsent(targetObject.javaClass) { _ -> computeFieldInjectors(targetObject.javaClass) }
        for (cachedInjector in fieldInjectors)
            cachedInjector.injection.inject(targetObject, cachedInjector.accessibleObject, cachedInjector.annotation, context)

        val methodInjectors = cachedMethodInjectors.computeIfAbsent(targetObject.javaClass) { _ -> computeMethodInjectors(targetObject.javaClass) }
        for (cachedInjector in methodInjectors)
            cachedInjector.injection.inject(targetObject, cachedInjector.accessibleObject, cachedInjector.annotation, context)
    }

    // implement BeanPostProcessor
    @Throws(BeansException::class)
    override fun postProcessBeforeInitialization(bean: Any, beanName: String): Any {
        return bean
    }

    @Throws(BeansException::class)
    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
        inject(bean, Keywords.NONE)

        // done

        return bean
    }

    companion object {
        private fun computeFields(clazz: Class<*>): Array<Field> {
            val fields: MutableCollection<Field> = ArrayList()

            fun collect(clazz: Class<*>) {
                val superclass = clazz.superclass
                if (superclass != null && superclass != Any::class.java)
                    collect(superclass)

                fields.addAll(arrayListOf(*clazz.getDeclaredFields()))
            }

            // go forrest

            collect(clazz)

            return fields.toTypedArray<Field>()
        }

        private fun computeMethods(clazz: Class<*>): Array<Method> {
            val methods: MutableCollection<Method> = ArrayList()

            fun collect(clazz: Class<*>) {
                val superclass = clazz.superclass
                if (superclass != null && superclass != Any::class.java)
                    collect(superclass)

                methods.addAll(arrayListOf(*clazz.getDeclaredMethods()))
            }

            // go forrest

            collect(clazz)

            return methods.toTypedArray<Method>()
        }
    }
}