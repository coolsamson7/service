package com.serious.util
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import java.lang.reflect.Method
import java.util.*

/**
 * A `MethodDispatcher` organizes a set of methods with identical signatures - possibly
 * defined in distinct classes - and is able to dispatch to an applicable method by analyzing
 * the first argument of - possibly multiple - supplied arguments.
 */
class MethodDispatcher {
    // local classes

    class NoApplicableMethodError(clazz: Class<*>) : RuntimeException("no applicable method for argument ${clazz.getName()}")

    class RegisteredMethod {
        // instance data

        private val instance: Any
        val method: Method
        var nextApplicableMethod: RegisteredMethod? = null

        // constructor
        internal constructor(instance: Any, method: Method) {
            this.instance = instance
            this.method = method

            method.setAccessible(true)
        }

        internal constructor(registeredMethod: RegisteredMethod) {
            instance = registeredMethod.instance
            method = registeredMethod.method
        }

        val parameterTypes: Array<Class<*>>
            get() = method.parameterTypes

        operator fun invoke(vararg args: Any): Any {
            return method.invoke(instance, *args)
        }

        // override Object

        override fun equals(other: Any?): Boolean {
            return (other is RegisteredMethod) && parameterTypes.contentEquals(other.parameterTypes)
        }

        override fun hashCode(): Int {
            return parameterTypes.contentHashCode()
        }

        override fun toString(): String {
            return "RegisteredMethod[method=$method]"
        }
    }

    private class SortedMethodCache {
        // instance data

        private val registeredMethods: MutableList<RegisteredMethod>
        private var uniqueMethods = false

        @Volatile
        private var cache: IdentityHashMap<Class<*>, RegisteredMethod> = IdentityHashMap<Class<*>, RegisteredMethod>(5)

        // constructor

        constructor() {
            registeredMethods = ArrayList()
        }

        constructor(original: SortedMethodCache) {
            registeredMethods = ArrayList(original.registeredMethods)
        }

        // methods

        fun ensureUniqueMethods(unique: Boolean) {
            if (uniqueMethods != unique) {
                uniqueMethods = unique
                rebuildCache()
            }
        }

        // private

        private fun rebuildCache() {
            val oldCache: IdentityHashMap<Class<*>, RegisteredMethod> = cache
            val newCache: IdentityHashMap<Class<*>, RegisteredMethod> = cache.clone() as IdentityHashMap<Class<*>, RegisteredMethod>

            for (entry: Map.Entry<Class<*>, RegisteredMethod> in oldCache.entries)
                methodForClass(entry.key, newCache)

            // replace

            cache = newCache
        }

        // replaces all visitors and resorts them
        private fun getApplicableMethodList(clazz: Class<*>): List<RegisteredMethod> {
            val applicableMethods: MutableList<RegisteredMethod> = ArrayList()

            // add candidates
            val classSet: MutableSet<Class<*>> = HashSet()
            for (iMethod in registeredMethods.indices) {
                val method = registeredMethods[iMethod]
                val c = method.parameterTypes[0]

                if (c.isAssignableFrom(clazz) && (!uniqueMethods || !classSet.contains(c))) {
                    applicableMethods.add(RegisteredMethod(method))
                    classSet.add(c)
                }
            }

            // sort

            Collections.sort(applicableMethods, Comparator { m1, m2 ->
                val c1 = m1.parameterTypes[0]
                val c2 = m2.parameterTypes[0]
                if (c1 == c2) 0 else if (c1.isAssignableFrom(c2)) 1 else -1
            })

            // chain

            var last: RegisteredMethod? = null
            for (registeredMethod: RegisteredMethod in applicableMethods) {
                if (last != null)
                    last.nextApplicableMethod = registeredMethod

                last = registeredMethod
            } // for

            // done

            return applicableMethods
        }

        // update registered methods

        @Synchronized
        fun addMethods(instance: Any, methods: List<Method>) {
            for (method: Method in methods)
                registeredMethods.add(RegisteredMethod(instance, method))

            rebuildCache()
        }

        @Synchronized
        fun replaceMethods(instance: Any, methods: List<Method>) {
            for (method: Method in methods) {
                val registeredMethod = RegisteredMethod(instance, method)

                val index = registeredMethods.indexOf(registeredMethod)
                if (index != -1)
                    registeredMethods[index] = registeredMethod
                else
                    registeredMethods.add(registeredMethod)
            }

            rebuildCache()
        }

        // find an applicable method for class c and cache the result
        // throws an Exception, if no method is applicable

        @Throws(NoApplicableMethodError::class)
        fun findApplicableMethod(clazz: Class<*>): RegisteredMethod {
            var method: RegisteredMethod? = cache.get(clazz)
            if (method == null) {
                val newCache: IdentityHashMap<Class<*>, RegisteredMethod> = cache.clone() as IdentityHashMap<Class<*>, RegisteredMethod>
                method = methodForClass(clazz, newCache)

                // replace
                cache = newCache
            } // if
            return if (method !== NO_APPLICABLE_METHOD) method
            else throw NoApplicableMethodError(clazz)
        }

        private fun methodForClass(clazz: Class<*>, newCache: MutableMap<Class<*>, RegisteredMethod>): RegisteredMethod {
            var method: RegisteredMethod
            val applicableMethodList = getApplicableMethodList(clazz)

            if (applicableMethodList.isEmpty())
                newCache[clazz] = NO_APPLICABLE_METHOD.also { method = it }
            else
                newCache[clazz] = applicableMethodList.get(0).also { method = it }

            return method
        }
    }

    // instance data

    private var methodCache: SortedMethodCache = SortedMethodCache()

    // constructor

    /**
     * create a new `MethodDispatcher`. The instance will collect all matching methods of
     * the supplied instance class.
     *
     * @param instance   the instance whose class provides the method definitions
     * @param methodName the name of the methods that are to be searched for
     */
    constructor(instance: Any, methodName: String) {
        addMethods(instance, methodName)
    }

    /**
     * create a new `MethodDispatcher`. The instance will collect all matching methods of
     * its own class.
     *
     * @param methodName the name of the methods that are to be searched for
     */
    constructor(methodName: String) {
        methodCache = SortedMethodCache()
        addMethods(this, methodName)
    }

    constructor(original: MethodDispatcher) {
        methodCache = SortedMethodCache(original.methodCache)
    }

    // public

    fun ensureUniqueMethods(unique: Boolean) {
        methodCache.ensureUniqueMethods(unique)
    }

    /**
     * look for all named methods of the instance's class and add them to the list of methods
     * that can be dispatched.
     *
     * @param instance   the instance whose class provides the method definitions.
     * @param methodName the name of the methods to be looked for.
     */
    fun addMethods(instance: Any, methodName: String) {
        val clazz: Class<*> = instance.javaClass
        try {
            val methods = clazz.getMethods() // all public methods!
            val methodList: MutableList<Method> = ArrayList()
            for (method: Method in methods)
                if ((method.name == methodName) && method.declaringClass != MethodDispatcher::class.java) {
                // do some sanity checks?
                methodList.add(method)
            } // if

            methodCache.addMethods(instance, methodList)
        } // try
        catch (exception: SecurityException) {
            // ignore
        }
    }

    /**
     * look for all named methods of the instance's class and add them to the list of methods
     * that can be dispatched possibly replacing
     * existing methods.
     *
     * @param instance   the instance whose class provides the method definitions.
     * @param methodName the name of the methods to be looked for.
     */
    fun replaceMethods(instance: Any, methodName: String) {
        val clazz: Class<*> = instance.javaClass
        try {
            val methods = clazz.getMethods() // all public methods!

            val methodList: MutableList<Method> = ArrayList()
            for (method: Method in methods)
                if ((method.name == methodName) && method.declaringClass != MethodDispatcher::class.java) {
                    // do some sanity checks?
                    methodList.add(method)
                } // if

            methodCache.replaceMethods(instance, methodList)
        } // try
        catch (exception: SecurityException) {
            // ignore
        }
    }

    /**
     * Invoke the most applicable method with respect to the supplied argument and returns its
     * return value.
     *
     * @param args the rest arguments
     * @return the return value of the invoked method
     * NoApplicableMethodError if no method is applicable.
     */
    fun dispatch(vararg args: Any): Any {
        return methodCache.findApplicableMethod(args[0].javaClass)(*args)
    }

    /**
     * return `true` if an applicable method for the supplied argument is available,
     * `false` otherwise.
     *
     * @param clazz the class of the first argument
     * @return `true` if an applicable method for the supplied argument is available,
     * `false` otherwise.
     */
    fun hasApplicableMethod(clazz: Class<*>): Boolean {
        try {
            methodCache.findApplicableMethod(clazz)
            return true
        }
        catch (error: NoApplicableMethodError) {
            return false
        }
    }

    fun getApplicableMethods(clazz: Class<*>): RegisteredMethod {
        return methodCache.findApplicableMethod(clazz)
    }

    fun getApplicableMethod(clazz: Class<*>): Method {
        return methodCache.findApplicableMethod(clazz).method
    }


    fun foo() {}

    companion object {
        private val NO_APPLICABLE_METHOD = RegisteredMethod(MethodDispatcher::class.java, MethodDispatcher::class.java.getDeclaredMethod("foo"))
    }
}
