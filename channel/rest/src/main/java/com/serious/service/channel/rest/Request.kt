package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.channel.rest.RequestBuilder.SpecOperation
import org.springframework.web.reactive.function.client.WebClient

typealias ResponseHandler = (spec: WebClient.ResponseSpec) -> Any

 /**
  * A `Request` covers the technical webclient details for a single method call
  * by caching the steps needed for a webclient builder which will be executed while executing the method call.
  */
class Request(private val specs: Array<SpecOperation<*>>, private val responseHandler: ResponseHandler) {
    // private
    private fun spec(vararg params: Any): RHS {
        var spec: RHS? = null

        for (operation in specs)
            spec = operation.build(spec as Nothing?, *params)

        return spec!!
    }

    // public
    fun execute(vararg args: Any): Any {
        return responseHandler(spec(*args).retrieve())
    }
}
