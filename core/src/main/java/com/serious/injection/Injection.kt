package com.serious.injection
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import java.lang.reflect.AccessibleObject

 /**
 * An `Injection` is responsible for the injection of a single resource into a target
 * object using a property of the target
 * object which is marked by an annotation. The property is an `AccessibleObject` in
 * the sense of Java reflection. To be
 * more precise: a field or a method; constructors are not supported. Any visibility of the
 * field/method (private, public, ...) is
 * supported.
 */
interface Injection<AnnotationType : Annotation?, InjectionContext>  {
    var annotationClass: Class<out Annotation>

    /**
     * Fetches the specified resource and injects it into the given target object using the given
     * accessible object (field or method).
     *
     * @param targetObject     the target object which shall be injected with the resource
     * @param accessibleObject the target object's property which shall be used for the injection
     * @param annotation       the annotation of the accessible object
     * @param context          the context in which th injection shall take place; specialized
     * `Injector` implementations define what
     * context they need
     */
    fun inject(targetObject: Any, accessibleObject: AccessibleObject, annotation: AnnotationType, context: InjectionContext)
}
