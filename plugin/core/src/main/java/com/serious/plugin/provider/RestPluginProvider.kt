package com.serious.plugin.provider

import com.serious.plugin.PluginMetadata
import com.serious.plugin.PluginProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import java.util.*


/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
@Component
@ConditionalOnProperty(value= arrayOf("plugin.provider"), havingValue = "rest", matchIfMissing = true)
class RestPluginProvider: PluginProvider {
    // instance data

    lateinit var client: WebClient

    @Value("\${plugin.server}")
    var server: String = "http://localhost:8083" // TODO

    // init

    init {
        client = WebClient.builder()
            .baseUrl(server)
            //.exchangeStrategies(useMaxMemory())
            //.defaultCookie("cookieKey", "cookieValue")
            //.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            //.defaultUriVariables(Collections.singletonMap("url", "http://localhost:8080"))
            .build()
    }

    // implement PluginProvider

    override fun read(metaData: PluginMetadata): ByteArray {
        return client
            .post()
            .uri("plugin/read")
            .bodyValue(metaData)
            //.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_OCTET_STREAM)
            .retrieve()
            .bodyToMono(ByteArray::class.java)
            .block()!!
    }

    override fun availablePlugins(): Array<PluginMetadata> {
        return client
            .get()
            .uri("plugin/list")
            //.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(Array<PluginMetadata>::class.java)
            .block()!!
    }
}