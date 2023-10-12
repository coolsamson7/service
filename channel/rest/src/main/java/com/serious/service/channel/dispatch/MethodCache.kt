package com.serious.service.channel.dispatch;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.*;

/**
 * @author Andreas Ernst
 */
@Component
public class MethodCache {
    // static methods

    private static String getSignature(Method method) {
        StringBuilder sb = new StringBuilder(32);

        sb.append(method.getName());

        sb.append('(');

        Class[] params = method.getParameterTypes();
        for (int i = 0; i < params.length; i++) {
            sb.append(getParamSignature(params[i]));

            if (i < (params.length - 1))
                sb.append(',');
        } // for

        sb.append(')');

        return sb.toString();
    }

    private static String getParamSignature(Class clazz) {
        StringBuilder sb = new StringBuilder(32);
        if (clazz.isArray()) {
            int dimensions = 0;
            while (clazz.isArray()) {
                dimensions++;
                clazz = clazz.getComponentType();
            }

            sb.append(clazz.getName());
            for (int i = 0; i < dimensions; i++)
                sb.append("[]");
        } // if
        else
            sb.append(clazz.getName());

        return sb.toString();
    }

    // local classes

    static class ClassMethods {
        Class clazz;
        Map<Method, Integer> method2Index = new HashMap<>();
        Map<Integer, Method> index2Method = new HashMap<>();

        // constructor

        public ClassMethods(Class clazz) {
            this.clazz = clazz;

            analyze();
        }

        // private

        void analyze() {
            List<Method> methods = Arrays.asList(clazz.getMethods()); // TODO ? ?getDeclared...

            methods.sort(Comparator.comparing(MethodCache::getSignature));

            int index = 0;
            for ( Method method : methods) {
                method2Index.put(method, index);
                index2Method.put(index, method);

                index++;
            }
        }

    }
    // instance data

    Map<Class, ClassMethods> class2Methods = new HashMap();

    // constructor

    // public

    public int getIndex(Class clazz, Method method) {
        return getClassMethods(clazz).method2Index.get(method);
    }

    public Method getMethod(Class clazz, int index) {
        return getClassMethods(clazz).index2Method.get(index);
    }

    // private

    private ClassMethods getClassMethods(Class clazz) {
        ClassMethods classMethods = class2Methods.get(clazz);
        if (classMethods == null)
            class2Methods.put(clazz, classMethods = new ClassMethods(clazz));

        return classMethods;
    }
}

