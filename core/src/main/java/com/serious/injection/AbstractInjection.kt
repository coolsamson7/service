package com.serious.injection;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.apache.logging.log4j.util.Strings;

import java.lang.annotation.Annotation;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Base implementation of an <code>Injector</code> which is able to inject resources via fields or
 * methods. It uses the following generic
 * types:
 * <ul>
 * <li><code>Resource</code>: the type of the resource to inject.</li>
 * <li><code>AnnotationType</code>: the type of annotation that requrests the injection of that
 * resource.</li>
 * <li><code>InjectionContext</code>: the type of the context that this injector depends on; if the
 * injector does not need any context
 * information, <code>Object</code> should be used.</li>
 * </ul>
 *
 * @author Andreas Ernst
 * @version 1.0
 */
public abstract class AbstractInjection<Resource, AnnotationType extends Annotation, InjectionContext> implements Injection {
    // instance data

    private final Class<? extends Annotation> annotation;

    // constructor

    protected AbstractInjection(Class<? extends Annotation> annotationClass) {
        this.annotation = annotationClass;
    }

    // implement Injection
    @Override
    public Class<? extends Annotation> getAnnotationClass() {
        return annotation;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void inject(Object targetObject, AccessibleObject accessibleObject, Annotation annotation, Object context) {
        Class<?> accessibleType = computeAccessibleType(accessibleObject, targetObject);
        Resource value;
        InjectionContext injectionContext;

        try {
            injectionContext = (InjectionContext) context;
        }
        catch (ClassCastException e) {
            throw new IllegalArgumentException("Wrong context type for injector " + this + ": " + context);
        }

        AnnotationType typedAnnotation;

        try {
            typedAnnotation = (AnnotationType) annotation;
        }
        catch (ClassCastException e) {
            throw new IllegalArgumentException("Annotation is not of expected type: " + annotation);
        }

        value = computeValue(targetObject, accessibleType, accessibleObject, typedAnnotation, injectionContext);

        if (accessibleObject instanceof Field)
            injectByField(targetObject, value, (Field) accessibleObject);
        else if (accessibleObject instanceof Method)
            injectByMethod(targetObject, value, (Method) accessibleObject);
    }

    private static Class<?> computeAccessibleType(AccessibleObject accessibleObject, Object accessibleObjectOwner) {
        if (accessibleObject instanceof Field)
            return ((Field) accessibleObject).getType();

        if (accessibleObject instanceof Method method) {
            Class<?>[] parameterTypes = method.getParameterTypes();

            if (parameterTypes.length != 1)
                throw new InjectionException("Cannot inject a value to object " + accessibleObjectOwner + " by means of method " + method.getName()
                        + ": Method must have exactly one parameter");

            return parameterTypes[0];
        }

        throw new InjectionException("Cannot inject a value to object " + accessibleObjectOwner + " by means of " + accessibleObject);
    }

    private void injectByField(Object targetObject, Resource value, Field field) {
        // temporary access grant must be an atomic operation
        synchronized (field) {
            try {
                field.setAccessible(true);
                field.set(targetObject, value);
            }
            catch (IllegalAccessException e) {
                throw new InjectionException("Failed to inject value " + value + " to field " + field.getName() + " of " + targetObject.getClass().getName(), e);
            }
            finally {
                field.setAccessible(false);
            }
        }
    }

    private void injectByMethod(Object targetObject, Resource value, Method method) {
        // temporary access grant must be an atomic operation
        synchronized (method) {
            try {
                method.setAccessible(true);
                method.invoke(targetObject, value);
            }
            catch (IllegalAccessException e) {
                throw new InjectionException("Failed to inject value " + value + " by calling method " + method.getName() + " of " + targetObject.getClass().getName(), e);
            }
            catch (InvocationTargetException e) {
                throw new InjectionException("Failed to inject value " + value + " by calling method " + method.getName() + " of " + targetObject.getClass().getName(),
                        e.getTargetException());
            }
            finally {
                method.setAccessible(false);
            }
        }
    }

    /**
     * Computes the resource that shall be injected into the target object by this injector.
     *
     * @param targetObject         the target object
     * @param accessibleObjectType the actual object type of the field or method (which should fit
     *                             to the type of the resource to inject)
     * @param accessibleObject     the field or method that shall be used for injection
     * @param annotation           the annotation of the field or method
     * @param context              the injection context
     * @return the resource to inject
     */
    protected abstract Resource computeValue(Object targetObject, Class accessibleObjectType, AccessibleObject accessibleObject, AnnotationType annotation, InjectionContext context);

    /**
     * Helper method that checks whether the given string contains a not null non empty string.
     *
     * @param value the string
     * @return <code>true</code> if the string has a nonempty value
     */
    protected boolean hasText(String value) {
        return !Strings.isEmpty(value);
    }
}