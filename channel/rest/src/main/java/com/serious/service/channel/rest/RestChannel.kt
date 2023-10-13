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
 */
@RegisterChannel("rest")
open class RestChannel(channelManager: ChannelManager, componentClass: Class<out Component>, address: ServiceAddress)
    : AbstractChannel(channelManager, componentClass, address) {

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

    override fun setup() {
        val channelBuilders = channelManager.getChannelBuilders(RestChannel::class.java) as List<AbstractRestChannelBuilder>

        // add some defaults

        var builder = WebClient.builder()
            .baseUrl(address.serviceInstances.get(0).uri.toString()) // for now
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)

        // custom stuff

        for (channelBuilder in channelBuilders)
            if ( channelBuilder.isApplicable(componentClass))
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
