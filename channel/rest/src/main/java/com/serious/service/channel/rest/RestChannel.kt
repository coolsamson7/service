package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.CommunicationException
import com.serious.exception.ServerException
import com.serious.jackson.ThrowableMapper
import com.serious.service.*
import com.serious.service.channel.AbstractChannel
import org.aopalliance.intercept.MethodInvocation
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.web.reactive.function.client.*
import reactor.core.publisher.Mono
import java.lang.reflect.Method
import java.net.URI
import java.util.concurrent.ConcurrentHashMap
import java.util.function.Consumer


//{"timestamp":"2023-10-18T09:02:16.790+00:00","status":500,"error":"Internal Server Error","path":"/exception/throwDeclared"}
data class SpringError(
    val timestamp: String,
    val status: Int,
    val error: String,
    val path: String
) : Exception()

/**
 * A `RestChannel` covers the technical protocol for http rest calls via `WebClient`
 */
@RegisterChannel("rest")
open class RestChannel(channelManager: ChannelManager, componentDescriptor: ComponentDescriptor<out Component>, address: ServiceAddress)
    : AbstractChannel(channelManager, componentDescriptor, address) {

    // local interfaces

    interface URIProvider {
        fun update(newAddress :ServiceAddress)
        fun provide() : URI
    }

    class URIValueProvider(var uri : URI) : URIProvider {
        override fun update(newAddress: ServiceAddress) {
            uri = newAddress.uri.get(0)
        }

        // implement URIProvider
        override fun provide(): URI {
            return uri
        }
    }

    class RoundRobinURIProvider(var uris : List<URI>) : URIProvider {
        // instance data

        private var index = 0

        // implement URIProvider
        override fun update(newAddress: ServiceAddress) {
            uris = newAddress.uri
            index = 0
        }

        override fun provide(): URI {
            try {
                return uris.get(index)
            }
            finally {
                index = ++index % uris.size
            }
        }
    }

    // instance data

    private var webClient: WebClient? = null
    lateinit private var uriProvider : URIProvider
    private val requests: MutableMap<Method, Request> = ConcurrentHashMap()

    // public

    fun roundRobin() {
        uriProvider = RoundRobinURIProvider(address.uri)
    }

    // private

    private fun getRequest(method: Method): Request {
        return requests.computeIfAbsent(method) { _ -> computeRequest(method) }
    }

    private fun computeRequest(method: Method): Request {
        return MethodAnalyzer().request(webClient!!, method)
    }

    // implement MethodInterceptor

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
                        Mono.error(ServerException(ThrowableMapper.fromJSON(errorBody, SpringError::class.java))) // TODO
                    }
            }
            else if (clientResponse.statusCode().is4xxClientError()) {
                return@ofResponseProcessor clientResponse
                    .bodyToMono<String>(String::class.java)
                    .flatMap<ClientResponse> { errorBody: String ->
                        Mono.error(CommunicationException(errorBody)) // TODO
                    }
            }
            else {
                return@ofResponseProcessor Mono.just<ClientResponse>(clientResponse)
            }
        }
    }

    override fun setup() {
        // local functions

        val urlModifyingFilter = ExchangeFilterFunction { clientRequest: ClientRequest, nextFilter: ExchangeFunction ->
            val url = clientRequest.url()
            val nextURI = uriProvider.provide();
            val newUrl: URI = URI.create("${nextURI.scheme}://${nextURI.authority}${url.path}")

            nextFilter.exchange( ClientRequest.from(clientRequest)
                .url(newUrl)
                .build())
        }

        // start with fixed uri

        uriProvider = URIValueProvider(address.uri.get(0))

        // fetch customizers

        val channelCustomizers = channelManager.getChannelCustomizers<AbstractRestChannelCustomizer>(this)

        // general stuff

        for (channelCustomizer in channelCustomizers)
            channelCustomizer.apply(this)

        // add some defaults

        var builder = WebClient.builder()
            .baseUrl(address.uri.get(0).toString()) // doesn't matter actually
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)

            .filter(errorHandler())
            .filter(urlModifyingFilter)

        // webclient stuff

        for (channelCustomizer in channelCustomizers)
            builder = channelCustomizer.customize(builder)

        // done

        webClient = builder.build()
    }

    override fun topologyUpdate(newAddress :ServiceAddress) {
        uriProvider.update(newAddress)

        // super

        super.topologyUpdate(newAddress) // for now...
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
