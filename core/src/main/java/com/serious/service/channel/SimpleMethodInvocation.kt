package com.serious.service.channel
/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/

import org.aopalliance.intercept.MethodInvocation
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Method

/**
 * @author Andreas Ernst
 */
class SimpleMethodInvocation : MethodInvocation {
    // instance data

    private var method: Method
    private var arguments: Array<Any>
    private var targetObject: Any?

    // constructor

    constructor(targetObject: Any?, method: Method, vararg args: Any) {
        this.targetObject = targetObject
        this.method = method
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