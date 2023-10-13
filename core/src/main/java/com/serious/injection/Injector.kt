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

 /**
 * An `Injector` is responsible for the complete dependency injection of target
 * objects. Basically, it performs two tasks:
 *
 *  * It serves as a registry for [Injection]s. An injector is registered for a certain type
 * of annotation. the injection manager can
 * only process annotated fields and methods if there is an injector registered for the annotation
 * type.
 *  * It performs the injection of resources into a target object. Therefore, it computes all
 * annotations of fields and methods of the
 * target type, looks up registered injectors for the annotations' types and - if present - calls,
 * one after the other, the
 * `inject` method of these injectors for the target object.
 */
class Injector : BeanPostProcessor {
    // local classes
    private class CachedInjector // constructor
    internal constructor(// instance data
        val accessibleObject: AccessibleObject, val annotation: Annotation, val injection: Injection<Annotation, Any>
    )

    // instance data
    // Registered injectors are collected in a LinkedHashMap in order to preserve the order of
    // registration (see methods cacheFieldInjectors and cacheMethodInjectors)
    private val injections: MutableMap<Class<out Annotation?>?, Injection<Annotation, Any>> = LinkedHashMap()
    private var cachedFieldInjectors: MutableMap<Class<*>, Array<CachedInjector>> = IdentityHashMap()
    private var cachedMethodInjectors: MutableMap<Class<*>, Array<CachedInjector>> = IdentityHashMap()

    // constructor
    constructor()

    fun injections(): Map<Class<out Annotation?>?, Injection<Annotation, Any>> {
        return injections
    }

    constructor(vararg injections: Injection<Annotation, Any>) {
        for (injection in injections) registerInjection(injection)
    }

    constructor(injections: List<Injection<Annotation, Any>>) {
        for (injection in injections) registerInjection(injection)
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
        cachedFieldInjectors = IdentityHashMap()
        cachedMethodInjectors = IdentityHashMap()
    }
    // public

    /**
     * Returns the registered injector for this annotation type.
     *
     * @param annotationClass the annotation type
     * @return the injector or `null` of there is no injector registered for that
     * annotation type
     */
    @Synchronized
    fun getInjection(annotationClass: Class<out Annotation?>?): Injection<Annotation, Any>? {
        return injections[annotationClass]
    }

    private fun cacheFieldInjectors(`object`: Any): Array<CachedInjector> {
        val clazz: Class<*> = `object`.javaClass

        // When computing the cached injectors consider the order in which the injectors have been
        // registered
        // (i.e. a field with an annotation whose injector has been registered first will be
        // injected first).
        // So, first collect all fields per annotation type...
        val annotatedFields: MutableMap<Class<out Annotation?>?, Array<Field>> = IdentityHashMap()
        for (field in computeFields(clazz)) {
            //val annotations = field.annotations
            for (annotation in field.getAnnotations()) {
                val annotationType: Class<out Annotation?> = annotation.annotationClass.java
                var fieldsWithAnnotation = annotatedFields[annotationType]
                fieldsWithAnnotation = if (fieldsWithAnnotation == null) arrayOf(field) else add2(
                    Field::class.java, fieldsWithAnnotation, field
                )
                annotatedFields[annotationType] = fieldsWithAnnotation
            } // for
        } // for

        // ... and then iterate over all registered injectors (LinkedHashMap, so order of
        // registration is preserved!)
        // and then use map of fields from above to cache the injectors in an ordered list
        val cachedInjectors: MutableList<CachedInjector> = ArrayList()
        for ((annotationType, value) in injections) {
            val fieldsWithAnnotation = annotatedFields[annotationType]
            if (fieldsWithAnnotation != null) {
                for (field in fieldsWithAnnotation) {
                    val annotation = field.getAnnotation(annotationType)!!
                    cachedInjectors.add(CachedInjector(field, annotation, value))
                }
            } // if
        } // for

        val injectors = cachedInjectors.toTypedArray<CachedInjector>()

        cachedFieldInjectors[clazz] = injectors

        return injectors
    }

    private fun cacheMethodInjectors(`object`: Any): Array<CachedInjector> {
        val clazz: Class<*> = `object`.javaClass

        // When computing the cached injectors consider the order in which the injectors have been
        // registered
        // (i.e. a method with an annotation whose injector has been registered first will be
        // injected first).
        // So, first collect all methods per annotation type...
        val annotatedMethods: MutableMap<Class<out Annotation?>?, Array<Method>> = IdentityHashMap()
        for (method in computeMethods(clazz)) {
            val annotations = method.annotations
            for (annotation in annotations) {
                val annotationType: Class<out Annotation?> = annotation::class.java
                var methodsWithAnnotation = annotatedMethods[annotationType]
                methodsWithAnnotation = if (methodsWithAnnotation == null) arrayOf(method) else add2(Method::class.java, methodsWithAnnotation, method)
                annotatedMethods[annotationType] = methodsWithAnnotation
            } // for
        } // for

        // ... and then iterate over all registered injectors (LinkedHashMap, so order of
        // registration is preserved!)
        // and then use map of methods from above to cache the injectors in an ordered list
        val cachedInjectors: MutableList<CachedInjector> = ArrayList()
        for ((annotationType, value) in injections) {
            val methodsWithAnnotation = annotatedMethods[annotationType]
            if (methodsWithAnnotation != null) {
                for (method in methodsWithAnnotation) {
                    val annotation = method.getAnnotation(annotationType)!!
                    cachedInjectors.add(CachedInjector(method, annotation, value))
                }
            } // if
        } // for

        val injectors = cachedInjectors.toTypedArray<CachedInjector>()

        cachedMethodInjectors[clazz] = injectors

        return injectors
    }

    private fun getFieldInjectors(clazz: Class<*>): Array<CachedInjector>? {
        return cachedFieldInjectors[clazz]
    }

    private fun getMethodInjectors(clazz: Class<*>): Array<CachedInjector>? {
        return cachedMethodInjectors[clazz]
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
        val clazz: Class<*> = targetObject.javaClass

        var fieldInjectors  = getFieldInjectors(clazz)
        var methodInjectors = getMethodInjectors(clazz)

        synchronized(this) {
            if (fieldInjectors == null) {
                fieldInjectors = cacheFieldInjectors(targetObject)
                methodInjectors = cacheMethodInjectors(targetObject)
            }
        } // synchronized

        for (cachedInjector in fieldInjectors!!) cachedInjector.injection.inject(
            targetObject,
            cachedInjector.accessibleObject,
            cachedInjector.annotation,
            context
        )

        for (cachedInjector in methodInjectors!!) cachedInjector.injection.inject(
            targetObject,
            cachedInjector.accessibleObject,
            cachedInjector.annotation,
            context
        )
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
            collectFields(clazz, fields)

            return fields.toTypedArray<Field>()
        }

        private fun collectFields(clazz: Class<*>, collectedFields: MutableCollection<Field>) {
            val superclass = clazz.superclass
            if (superclass != null && superclass != Any::class.java)
                // Needn't collect fields of Object, cannot be annotated...
                collectFields(superclass, collectedFields)

            Collections.addAll(collectedFields, *clazz.getDeclaredFields())
        }

        private fun computeMethods(clazz: Class<*>): Array<Method> {
            val methods: MutableCollection<Method> = ArrayList()
            collectMethods(clazz, methods)

            return methods.toTypedArray<Method>()
        }

        private fun collectMethods(clazz: Class<*>, collectedMethods: MutableCollection<Method>) {
            val superclass = clazz.superclass
            if (superclass != null && superclass != Any::class.java)
                // Needn't collect methods of Object, cannot be annotated...
                collectMethods(superclass, collectedMethods)

            Collections.addAll(collectedMethods, *clazz.getDeclaredMethods())
        }
    }
}