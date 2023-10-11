package com.serious.injection

import org.apache.logging.log4j.util.Strings
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Field
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * Base implementation of an `Injector` which is able to inject resources via fields or
 * methods. It uses the following generic
 * types:
 *
 *  * `Resource`: the type of the resource to inject.
 *  * `AnnotationType`: the type of annotation that requrests the injection of that
 * resource.
 *  * `InjectionContext`: the type of the context that this injector depends on; if the
 * injector does not need any context
 * information, `Object` should be used.
 *
 *
 * @author Andreas Ernst
 * @version 1.0
 */
abstract class AbstractInjection<Resource, AnnotationType : Annotation?, InjectionContext> // constructor
protected constructor(// implement Injection
    // instance data
    override var annotationClass: Class<out Annotation>
) : Injection<AnnotationType, InjectionContext> {

    /**
     * {@inheritDoc}
     */
    override fun inject(targetObject: Any, accessibleObject: AccessibleObject, annotation: AnnotationType, context: InjectionContext) {
        val accessibleType = computeAccessibleType(accessibleObject, targetObject)
        val value: Resource
        val injectionContext: InjectionContext
        injectionContext = try {
            context as InjectionContext
        } catch (e: ClassCastException) {
            throw IllegalArgumentException("Wrong context type for injector $this: $context")
        }
        val typedAnnotation: AnnotationType
        typedAnnotation = try {
            annotation as AnnotationType
        } catch (e: ClassCastException) {
            throw IllegalArgumentException("Annotation is not of expected type: $annotation")
        }
        value = computeValue(targetObject, accessibleType, accessibleObject, typedAnnotation, injectionContext)
        if (accessibleObject is Field) injectByField(
            targetObject,
            value,
            accessibleObject
        ) else if (accessibleObject is Method) injectByMethod(targetObject, value, accessibleObject)
    }

    private fun injectByField(targetObject: Any, value: Resource, field: Field) {
        // temporary access grant must be an atomic operation
        synchronized(field) {
            try {
                field.setAccessible(true)
                field[targetObject] = value
            } catch (e: IllegalAccessException) {
                throw InjectionException(
                    "Failed to inject value " + value + " to field " + field.name + " of " + targetObject.javaClass.getName(),
                    e
                )
            } finally {
                field.setAccessible(false)
            }
        }
    }

    private fun injectByMethod(targetObject: Any, value: Resource, method: Method) {
        // temporary access grant must be an atomic operation
        synchronized(method) {
            try {
                method.setAccessible(true)
                method.invoke(targetObject, value)
            } catch (e: IllegalAccessException) {
                throw InjectionException(
                    "Failed to inject value " + value + " by calling method " + method.name + " of " + targetObject.javaClass.getName(),
                    e
                )
            } catch (e: InvocationTargetException) {
                throw InjectionException(
                    "Failed to inject value " + value + " by calling method " + method.name + " of " + targetObject.javaClass.getName(),
                    e.targetException
                )
            } finally {
                method.setAccessible(false)
            }
        }
    }

    /**
     * Computes the resource that shall be injected into the target object by this injector.
     *
     * @param targetObject         the target object
     * @param accessibleObjectType the actual object type of the field or method (which should fit
     * to the type of the resource to inject)
     * @param accessibleObject     the field or method that shall be used for injection
     * @param annotation           the annotation of the field or method
     * @param context              the injection context
     * @return the resource to inject
     */
    protected abstract fun computeValue(
        targetObject: Any?,
        accessibleObjectType: Class<*>?,
        accessibleObject: AccessibleObject?,
        annotation: AnnotationType,
        context: InjectionContext
    ): Resource

    /**
     * Helper method that checks whether the given string contains a not null non empty string.
     *
     * @param value the string
     * @return `true` if the string has a nonempty value
     */
    protected fun hasText(value: String?): Boolean {
        return !Strings.isEmpty(value)
    }

    companion object {
        private fun computeAccessibleType(accessibleObject: AccessibleObject, accessibleObjectOwner: Any): Class<*> {
            if (accessibleObject is Field) return accessibleObject.type
            if (accessibleObject is Method) {
                val parameterTypes: Array<Class<*>> = accessibleObject.parameterTypes
                if (parameterTypes.size != 1) throw InjectionException(
                    "Cannot inject a value to object " + accessibleObjectOwner + " by means of method " + accessibleObject.name
                            + ": Method must have exactly one parameter"
                )
                return parameterTypes[0]
            }
            throw InjectionException("Cannot inject a value to object $accessibleObjectOwner by means of $accessibleObject")
        }
    }
}