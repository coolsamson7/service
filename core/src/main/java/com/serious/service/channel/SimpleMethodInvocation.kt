package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.aopalliance.intercept.MethodInvocation
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Method

/**
 * Simple [MethodInvocation] implementation
 */
class SimpleMethodInvocation(private var targetObject: Any?, private var method: Method, vararg args: Any) : MethodInvocation {
    // instance data

    private var arguments: Array<Any>

    // constructor

    init {
        this.arguments = args as Array<Any>
    }

    // implement
    override fun getArguments(): Array<Any> {
        return arguments
    }

    override fun getMethod(): Method {
        return method
    }

    override fun getStaticPart(): AccessibleObject {
        throw UnsupportedOperationException("mock method not implemented")
    }

    override fun getThis(): Any? {
        return targetObject
    }

    override fun proceed(): Any? {
        throw UnsupportedOperationException("mock method not implemented")
    }

    override fun toString(): String {
        return "method invocation [" + method + "]"
    }
}