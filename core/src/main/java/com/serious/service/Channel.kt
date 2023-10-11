package com.serious.service

import org.aopalliance.intercept.MethodInterceptor
import java.lang.reflect.InvocationHandler

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
interface Channel : MethodInterceptor, InvocationHandler {
    fun getPrimaryAddress(): ServiceAddress?
    fun getAddresses(): List<ServiceAddress?>?
    fun needsUpdate(delta: ServiceInstanceRegistry.Delta?): Boolean
    fun setup(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>?)
}
