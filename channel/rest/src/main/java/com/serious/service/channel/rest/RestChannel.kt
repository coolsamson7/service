package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.Component
import com.serious.service.RegisterChannel
import com.serious.service.ServiceAddress
import com.serious.service.channel.AbstractChannel
import org.aopalliance.intercept.MethodInvocation
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.lang.reflect.Method
import java.util.concurrent.ConcurrentHashMap
import java.util.function.Consumer

/**
 * A `RestChannel` covers the technical protocol for http rest calls via `WebClient`
 *
 * @author Andreas Ernst
 */
@RegisterChannel("rest")
open class RestChannel @Autowired constructor(channelManager: ChannelManager) : AbstractChannel(channelManager) {
    // instance data

    private var webClient: WebClient? = null
    private val requests: MutableMap<Method, Request> = ConcurrentHashMap()

    // private

    private fun getRequest(method: Method): Request {
        return requests.computeIfAbsent(method) { _ -> computeRequest(method) }
    }

    private fun computeRequest(method: Method): Request {
        return MethodAnalyzer().request(webClient!!, method)
    }

    // implement Channel

    override fun invoke(invocation: MethodInvocation): Any {
        return getRequest(invocation.method).execute(*invocation.arguments)
    }

    override fun setup(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>) {
        super.setup(componentClass, serviceAddresses)

        val channelBuilder = channelManager.getChannelBuilder(RestChannel::class.java) as AbstractRestChannelBuilder?
        var builder = WebClient.builder()

        // add some defaults
        builder
            .baseUrl(getPrimaryAddress()!!.uri.toString())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)

        // custom stuff

        if (channelBuilder != null && channelBuilder.isApplicable(componentClass))
            builder = channelBuilder.build(builder)

        // done

        webClient = builder.build()
    }

    companion object {
        // This method returns filter function which will log request data
        private fun logRequest(): ExchangeFilterFunction {
            return ExchangeFilterFunction.ofRequestProcessor { clientRequest: ClientRequest ->
                println(clientRequest.method().toString() + " " + clientRequest.url())
                clientRequest.headers().forEach { name: String, values: List<String> ->
                    values.forEach(
                        Consumer { value: String -> println("\t$name=$value") })
                }
                Mono.just(clientRequest)
            }
        }
    }
}
