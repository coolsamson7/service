package com.serious.injection;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.lang.Keywords;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

import java.lang.annotation.Annotation;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;

/**
 * An <code>Injector</code> is responsible for the complete dependency injection of target
 * objects. Basically, it performs two tasks:
 * <ul>
 * <li>It serves as a registry for {@link Injection}s. An injector is registered for a certain type
 * of annotation. the injection manager can
 * only process annotated fields and methods if there is an injector registered for the annotation
 * type.</li>
 * <li>It performs the injection of resources into a target object. Therefore, it computes all
 * annotations of fields and methods of the
 * target type, looks up registered injectors for the annotations' types and - if present - calls,
 * one after the other, the
 * <code>inject</code> method of these injectors for the target object.</li>
 * </ul>
 *
 * @author Andreas Ernst
 */
public class Injector implements BeanPostProcessor {
    // local classes

    private static final class CachedInjector {
        // instance data

        public final AccessibleObject accessibleObject;
        public final Injection injection;
        public final Annotation annotation;

        // constructor

        CachedInjector(AccessibleObject accessibleObject, Annotation annotation, Injection injection) {
            this.accessibleObject = accessibleObject;
            this.injection = injection;
            this.annotation = annotation;
        }
    }

    // instance data

    // Registered injectors are collected in a LinkedHashMap in order to preserve the order of
    // registration (see methods cacheFieldInjectors and cacheMethodInjectors)

    private final Map<Class<? extends Annotation>, Injection> injections = new LinkedHashMap<Class<? extends Annotation>, Injection>();
    private Map<Class, CachedInjector[]> cachedFieldInjectors = null;
    private Map<Class, CachedInjector[]> cachedMethodInjectors = null;

    // constructor

    public Injector() {
    }

    Map<Class<? extends Annotation>, Injection> injections() {
        //noinspection ReturnOfCollectionOrArrayField
        return injections;
    }

    public Injector(Injection... injections) {
        for (Injection injection : injections)
            registerInjection(injection);
    }

    public Injector(List<Injection> injections) {
        for (Injection injection : injections)
            registerInjection(injection);
    }

    // public

    /**
     * Registers a dependency injector for the given annotation type. The manager will use this
     * injector for a given object if there are
     * fields in the object's class with annotation of this annotation type.
     *
     * @param injection the injector instance
     */
    public synchronized void registerInjection(Injection injection) {
        injections.put(injection.getAnnotationClass(), injection);

        cachedFieldInjectors = null;
        cachedMethodInjectors = null;
    }

    // public

    /**
     * Returns the registered injector for this annotation type.
     *
     * @param annotationClass the annotation type
     * @return the injector or <code>null</code> of there is no injector registered for that
     * annotation type
     */
    public synchronized Injection getInjection(Class<? extends Annotation> annotationClass) {
        return injections.get(annotationClass);
    }

    private void cacheFieldInjectors(Object object) {
        if (cachedFieldInjectors == null)
            cachedFieldInjectors = new IdentityHashMap<Class, CachedInjector[]>();

        Class clazz = object.getClass();

        // When computing the cached injectors consider the order in which the injectors have been
        // registered
        // (i.e. a field with an annotation whose injector has been registered first will be
        // injected first).
        // So, first collect all fields per annotation type...

        Map<Class<? extends Annotation>, Field[]> annotatedFields = new IdentityHashMap<Class<? extends Annotation>, Field[]>();

        for (Field field : computeFields(clazz)) {
            Annotation[] annotations = field.getAnnotations();

            for (Annotation annotation : annotations) {
                Class<? extends Annotation> annotationType = annotation.annotationType();
                Field[] fieldsWithAnnotation = annotatedFields.get(annotationType);

                if (fieldsWithAnnotation == null)
                    fieldsWithAnnotation = new Field[]{field};
                else
                    fieldsWithAnnotation = com.serious.collections.Arrays.add2(Field.class, fieldsWithAnnotation, field);

                annotatedFields.put(annotationType, fieldsWithAnnotation);
            } // for
        } // for

        // ... and then iterate over all registered injectors (LinkedHashMap, so order of
        // registration is preserved!)
        // and then use map of fields from above to cache the injectors in an ordered list

        List<CachedInjector> cachedInjectors = new ArrayList<CachedInjector>();

        for (Map.Entry<Class<? extends Annotation>, Injection> entry : injections.entrySet()) {
            Class<? extends Annotation> annotationType = entry.getKey();
            Field[] fieldsWithAnnotation = annotatedFields.get(annotationType);

            if (fieldsWithAnnotation != null) {
                for (Field field : fieldsWithAnnotation) {
                    Annotation annotation = field.getAnnotation(annotationType);

                    cachedInjectors.add(new CachedInjector(field, annotation, entry.getValue()));
                }
            } // if
        } // for

        cachedFieldInjectors.put(object.getClass(), cachedInjectors.toArray(new CachedInjector[cachedInjectors.size()]));
    }

    private void cacheMethodInjectors(Object object) {
        if (cachedMethodInjectors == null)
            cachedMethodInjectors = new IdentityHashMap<Class, CachedInjector[]>();

        Class clazz = object.getClass();

        // When computing the cached injectors consider the order in which the injectors have been
        // registered
        // (i.e. a method with an annotation whose injector has been registered first will be
        // injected first).
        // So, first collect all methods per annotation type...

        Map<Class<? extends Annotation>, Method[]> annotatedMethods = new IdentityHashMap<Class<? extends Annotation>, Method[]>();

        for (Method method : computeMethods(clazz)) {
            Annotation[] annotations = method.getAnnotations();

            for (Annotation annotation : annotations) {
                Class<? extends Annotation> annotationType = annotation.annotationType();
                Method[] methodsWithAnnotation = annotatedMethods.get(annotationType);

                if (methodsWithAnnotation == null)
                    methodsWithAnnotation = new Method[]{method};
                else
                    methodsWithAnnotation = com.serious.collections.Arrays.add2(Method.class, methodsWithAnnotation, method);

                annotatedMethods.put(annotationType, methodsWithAnnotation);
            } // for
        } // for

        // ... and then iterate over all registered injectors (LinkedHashMap, so order of
        // registration is preserved!)
        // and then use map of methods from above to cache the injectors in an ordered list

        List<CachedInjector> cachedInjectors = new ArrayList<CachedInjector>();

        for (Map.Entry<Class<? extends Annotation>, Injection> entry : injections.entrySet()) {
            Class<? extends Annotation> annotationType = entry.getKey();
            Method[] methodsWithAnnotation = annotatedMethods.get(annotationType);

            if (methodsWithAnnotation != null) {
                for (Method method : methodsWithAnnotation) {
                    Annotation annotation = method.getAnnotation(annotationType);

                    cachedInjectors.add(new CachedInjector(method, annotation, entry.getValue()));
                }
            } // if
        } // for

        cachedMethodInjectors.put(clazz, cachedInjectors.toArray(new CachedInjector[cachedInjectors.size()]));
    }

    private CachedInjector[] getFieldInjectors(Class clazz) {
        return cachedFieldInjectors.get(clazz);
    }

    private CachedInjector[] getMethodInjectors(Class clazz) {
        return cachedMethodInjectors.get(clazz);
    }

    /**
     * Performs the dependency injection for the given target object.
     *
     * @param targetObject the target object
     * @param context      the context information; the caller of this method has to know which kind of
     *                     context is needed (it depends on the
     *                     needs of the injectors that have been registered by the caller)
     */
    public void inject(Object targetObject, Object context) {
        Class clazz = targetObject.getClass();
        CachedInjector[] fieldInjectors = null;
        CachedInjector[] methodInjectors;

        synchronized (this) {
            if (cachedFieldInjectors == null || ((fieldInjectors = getFieldInjectors(clazz)) == null)) {
                cacheFieldInjectors(targetObject);
                cacheMethodInjectors(targetObject);
            }

            if (fieldInjectors == null)
                fieldInjectors = getFieldInjectors(clazz);

            methodInjectors = getMethodInjectors(clazz);
        } // synchronized

        for (CachedInjector cachedInjector : fieldInjectors)
            cachedInjector.injection.inject(targetObject, cachedInjector.accessibleObject, cachedInjector.annotation, context);

        for (CachedInjector cachedInjector : methodInjectors)
            cachedInjector.injection.inject(targetObject, cachedInjector.accessibleObject, cachedInjector.annotation, context);
    }

    private static Field[] computeFields(Class clazz) {
        Collection<Field> fields = new ArrayList<Field>();

        collectFields(clazz, fields);

        return fields.toArray(new Field[fields.size()]);
    }

    private static void collectFields(Class clazz, Collection<Field> collectedFields) {
        Class superclass = clazz.getSuperclass();

        if ((superclass != null) && (superclass != Object.class)) // Needn't collect fields of
            // Object, cannot be annotated...
            collectFields(superclass, collectedFields);

        Field[] fields = clazz.getDeclaredFields();

        Collections.addAll(collectedFields, fields);
    }

    private static Method[] computeMethods(Class clazz) {
        List<Method> methods = new ArrayList<Method>();

        collectMethods(clazz, methods);

        return methods.toArray(new Method[methods.size()]);
    }

    private static void collectMethods(Class clazz, List<Method> collectedMethods) {
        Class superclass = clazz.getSuperclass();

        if ((superclass != null) && (superclass != Object.class)) // Needn't collect methods of
            // Object, cannot be annotated...
            collectMethods(superclass, collectedMethods);

        Method[] methods = clazz.getDeclaredMethods();

        Collections.addAll(collectedMethods, methods);
    }

    // implement BeanPostProcessor

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        inject(bean, Keywords.NONE);

        // done

        return bean;
    }
}