package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import org.springframework.http.MediaType
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.util.UriBuilder

typealias RHS = WebClient.RequestHeadersSpec<*>

 /**
 * @author Andreas Ernst
 */
class RequestBuilder<S : RHS> internal constructor(var client: WebClient) {
    // inner classes

    interface SpecOperation<S> {
        fun build(spec: S?, vararg args: Any?): RHS
    }

    // general stuff
    internal inner class Accept(vararg acceptableMediaTypes: MediaType) : SpecOperation<S> {
        // instance data

        var acceptableMediaTypes: Array<out MediaType>

        // constructor
        init {
            this.acceptableMediaTypes = acceptableMediaTypes
        }

        // implement
        override fun build(spec: S?, vararg args: Any?): RHS {
            return spec!!.accept(*acceptableMediaTypes)
        }
    }

    // http methods
    internal inner class Get : SpecOperation<S> {
        override fun build(spec: S?, vararg args: Any?): RHS {
            return client.get()
        }
    }

    internal inner class Put : SpecOperation<S> {
        override fun build(spec: S?, vararg args: Any?): WebClient.RequestHeadersSpec<*> {
            return client.put()
        }
    }

    internal inner class Delete : SpecOperation<S> {
        override fun build(spec: S?, vararg args: Any?): RHS {
            return client.delete()
        }
    }

    internal inner class Post : SpecOperation<S> {
        override fun build(spec: S?, vararg args: Any?): RHS {
            return client.post()
        }
    }

    internal inner class Body(private val index: Int) : SpecOperation<WebClient.RequestBodySpec> {
        // implement
        override fun build(spec: WebClient.RequestBodySpec?, vararg args: Any?): RHS {
            return spec!!.bodyValue(args!![index])
        }
    }

    internal inner class URI(private val uri: String, private val indizes: Array<Int>, private val requestParams: Map<String, Int>
    ) : SpecOperation<WebClient.RequestHeadersUriSpec<*>> {
        // override
        override fun build(spec: WebClient.RequestHeadersUriSpec<*>?, vararg args: Any?): WebClient.RequestHeadersSpec<*> {
            // extract args

            val ids = arrayOfNulls<Any>(indizes.size)
            for (i in ids.indices)
                ids[i] = args[indizes[i]]

            return spec!!.uri { uriBuilder: UriBuilder ->
                val p = uriBuilder.path(uri)

                // add request params

                for ((key, value) in requestParams)
                    p.queryParam(key, args[value])

                p.build(*ids)
            }
        }
    }

    // instance data

    var operations = ArrayList<SpecOperation<S>>()

    // builder
    fun accept(vararg acceptableMediaTypes: MediaType): RequestBuilder<S> {
        operations.add(Accept(*acceptableMediaTypes))
        return this
    }

    // operations
    fun get(): RequestBuilder<S> {
        operations.add(Get())
        return this
    }

    fun put(): RequestBuilder<S> {
        operations.add(Put())
        return this
    }

    fun delete(): RequestBuilder<S> {
        operations.add(Delete())
        return this
    }

    fun uri(uri: String, args: Array<Int>, requestParams: Map<String, Int>): RequestBuilder<S> {
        operations.add(URI(uri, args, requestParams) as SpecOperation<S>)
        return this
    }

    fun post(): RequestBuilder<S> {
        operations.add(Post())
        return this
    }

    fun body(index: Int): RequestBuilder<S> {
        operations.add(Body(index) as SpecOperation<S>)
        return this
    }
}