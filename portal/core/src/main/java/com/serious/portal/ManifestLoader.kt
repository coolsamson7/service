package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */


import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.portal.model.Manifest
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import java.net.URL

@Component
class ManifestLoader {
    // instance data

    @Autowired
    lateinit var objectMapper: ObjectMapper

    final var client: WebClient

    // constructor

    init {
        this.client = WebClient.builder()
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build()
    }

    @PostConstruct
    fun init() {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL)
    }

    // public

    fun load(url: URL) : Manifest {
        println("load ulr " + url.toString())

        return this.client.get().uri(url.toString() + "/assets/manifest.json")
            .retrieve()
            .bodyToMono(Manifest::class.java).block()!!
    }
}
