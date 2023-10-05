package com.serious.lang;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.util.Map;

/**
 *
 */
public class Annotations {
    private Annotations() {
    }

    // methods

    /**
     * Changes the annotation value for the given key of the given annotation to newValue and returns
     * the previous value.
     */
    @SuppressWarnings("unchecked")
    public static Object changeAnnotationValue(Annotation annotation, String key, Object newValue) {
        Object handler = Proxy.getInvocationHandler(annotation);
        Field field;
        try {
            field = handler.getClass().getDeclaredField("memberValues");
        }
        catch (NoSuchFieldException | SecurityException e) {
            throw new IllegalStateException(e);
        }

        field.setAccessible(true);

        Map<String, Object> memberValues;
        try {
            memberValues = (Map<String, Object>) field.get(handler);
        }
        catch (IllegalArgumentException | IllegalAccessException e) {
            throw new IllegalStateException(e);
        }

        Object oldValue = memberValues.get(key);
        if (oldValue == null || oldValue.getClass() != newValue.getClass()) {
            throw new IllegalArgumentException();
        }

        memberValues.put(key, newValue);

        return oldValue;
    }
}