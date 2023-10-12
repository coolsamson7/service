package com.serious.service.channel.dispatch
/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/

import java.io.Serializable

/**
 * A <code>ServiceRequest</code> covers all attributes required to call a service methods.
 */
data class ServiceRequest(
    var service: String,
    var method: Int,
    var arguments: Array<Any>
) :Serializable