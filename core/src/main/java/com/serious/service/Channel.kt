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
     /**
      * return the supported [ComponentDescriptor]
      */
    val component: String

     /**
      * return the channel name
      */
    val name : String

     /**
      * return the associated [ServiceAddress]
      */
    val address : ServiceAddress

     /**
      * setup the channel details based on the supplied address
      */
    fun setup()

     /**
      * react to topology updates
      *
      * @param newAddress the new [ServiceAddress]
      */
    fun topologyUpdate(newAddress: ServiceAddress)
}
