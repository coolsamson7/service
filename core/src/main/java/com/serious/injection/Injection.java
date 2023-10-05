package com.serious.injection;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.lang.annotation.Annotation;
import java.lang.reflect.AccessibleObject;

/**
 * An <code>Injection</code> is responsible for the injection of a single resource into a target
 * object using a property of the target
 * object which is marked by a Java5 annotation. The property is an <code>AccessibleObject</code> in
 * the sense of Java reflection. To be
 * more precise: a field or a method; constructors are not supported. Any visibility of the
 * field/method (private, public, ...) is
 * supported.
 *
 * @author Andreas Ernst
 * @version 1.0
 */
public interface Injection {
    Class<? extends Annotation> getAnnotationClass();

    /**
     * Fetches the specified resource and injects it into the given target object using the given
     * accessible object (field or method).
     *
     * @param targetObject     the target object which shall be injected with the resource
     * @param accessibleObject the target object's property which shall be used for the injection
     * @param annotation       the annotation of the accessible object
     * @param context          the context in which th injection shall take place; specialized
     *                         <code>Injector</code> implementations define what
     *                         context they need
     */
    void inject(Object targetObject, AccessibleObject accessibleObject, Annotation annotation, Object context);
}
