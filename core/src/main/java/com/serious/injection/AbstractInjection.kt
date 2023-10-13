package com.serious.injection
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.apache.logging.log4j.util.Strings
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Field
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

 /**
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
 */
abstract class AbstractInjection<Resource, AnnotationType : Annotation?, InjectionContext> // constructor
protected constructor(override var annotationClass: Class<out Annotation>) : Injection<AnnotationType, InjectionContext> {

    override fun inject(targetObject: Any, accessibleObject: AccessibleObject, annotation: AnnotationType, context: InjectionContext) {
        val accessibleType = computeAccessibleType(accessibleObject, targetObject)

        val value = computeValue(targetObject, accessibleType, accessibleObject, annotation, context)

        if (accessibleObject is Field)
            injectByField(targetObject, value, accessibleObject)

        else if (accessibleObject is Method)
            injectByMethod(targetObject, value, accessibleObject)
    }

    private fun injectByField(targetObject: Any, value: Resource, field: Field) {
        synchronized(field) {
            try {
                field.setAccessible(true)
                field[targetObject] = value
            }
            catch (e: IllegalAccessException) {
                throw InjectionException("Failed to inject value " + value + " to field " + field.name + " of " + targetObject.javaClass.getName(), e)
            }
            finally {
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
            }
            catch (e: IllegalAccessException) {
                throw InjectionException("Failed to inject value " + value + " by calling method " + method.name + " of " + targetObject.javaClass.getName(), e)
            }
            catch (e: InvocationTargetException) {
                throw InjectionException("Failed to inject value " + value + " by calling method " + method.name + " of " + targetObject.javaClass.getName(), e.targetException)
            }
            finally {
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
            if (accessibleObject is Field)
                return accessibleObject.type

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