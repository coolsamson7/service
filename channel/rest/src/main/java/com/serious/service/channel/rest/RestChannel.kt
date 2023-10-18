package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.ServerException
import com.serious.jackson.ThrowableMapper
import com.serious.service.*
import com.serious.service.channel.AbstractChannel
import org.aopalliance.intercept.MethodInvocation
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ClientResponse
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

    fun errorHandler(): ExchangeFilterFunction {
        return ExchangeFilterFunction.ofResponseProcessor { clientResponse: ClientResponse ->
            if (clientResponse.statusCode().value() == 210) {
                return@ofResponseProcessor clientResponse
                    .bodyToMono<String>(String::class.java)
                    .flatMap<ClientResponse> { errorBody: String ->
                        Mono.error(ThrowableMapper.fromJSON(errorBody))
                    }
            }
            else if (clientResponse.statusCode().value() == 512) {
                return@ofResponseProcessor clientResponse
                    .bodyToMono<String>(String::class.java)
                    .flatMap<ClientResponse> { errorBody: String ->
                        Mono.error(ServerException(ThrowableMapper.fromJSON(errorBody)))
                    }
            }
            else if (clientResponse.statusCode().is5xxServerError()) {
                return@ofResponseProcessor clientResponse
                    .bodyToMono<String>(String::class.java)
                    .flatMap<ClientResponse> { errorBody: String ->
                        Mono.error(ServerException(errorBody)) // TODO
                    }
            }
            else if (clientResponse.statusCode().is4xxClientError()) {
                return@ofResponseProcessor clientResponse
                    .bodyToMono<String>(String::class.java)
                    .flatMap<ClientResponse> { errorBody: String ->
                        Mono.error(ServerException(errorBody)) // TODO
                    }
            }
            else {
                return@ofResponseProcessor Mono.just<ClientResponse>(clientResponse)
            }
        }
    }
    override fun setup() {
        val channelBuilders = channelManager.getChannelBuilders(RestChannel::class.java) as List<AbstractRestChannelBuilder>

        // add some defaults

        var builder = WebClient.builder()
            .baseUrl(address.serviceInstances.get(0).uri.toString()) // TODO for now
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)

            .filter(errorHandler())

        // custom stuff

        for (channelBuilder in channelBuilders)
            if ( channelBuilder.isApplicable(componentClass))
                builder = channelBuilder.build(builder)

        // done

        webClient = builder.build()
    }

    override fun needsUpdate(delta: ServiceInstanceRegistry.Delta): Boolean {
        return delta.isDeleted(address.serviceInstances.get(0)) // TODO cluster??
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
