package com.serious.service.channel;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.aopalliance.intercept.MethodInvocation;

import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Method;

/**
 * @author Andreas Ernst
 */
public class SimpleMethodInvocation implements MethodInvocation {
    private Method method;
    private Object[] arguments;
    private Object targetObject;

    public SimpleMethodInvocation(Object targetObject, Method method, Object... arguments) {
        this.targetObject = targetObject;
        this.method = method;
        this.arguments = arguments != null ? arguments : new Object[0];
    }

    public SimpleMethodInvocation() {
    }

    public Object[] getArguments() {
        return this.arguments;
    }

    public Method getMethod() {
        return this.method;
    }

    public AccessibleObject getStaticPart() {
        throw new UnsupportedOperationException("mock method not implemented");
    }

    public Object getThis() {
        return this.targetObject;
    }

    public Object proceed() {
        throw new UnsupportedOperationException("mock method not implemented");
    }

    public String toString() {
        return "method invocation [" + this.method + "]";
    }
}