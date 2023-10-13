package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.aopalliance.intercept.MethodInterceptor
import java.lang.reflect.InvocationHandler

 /**
 * A `Channel` is the communication mechanism used by the different [Service]s.
 */
interface Channel : MethodInterceptor, InvocationHandler {
    fun setup()

    fun getPrimaryAddress(): ServiceAddress?

     /**
      * return the associated list of [ServiceAddress]s
      */
    fun getAddresses(): List<ServiceAddress>

    fun needsUpdate(delta: ServiceInstanceRegistry.Delta): Boolean
}
