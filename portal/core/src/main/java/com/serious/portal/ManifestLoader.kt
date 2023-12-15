package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.portal.model.Manifest
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

    var client: WebClient? = null

    // constructor

    constructor() {
        this.client = WebClient.builder()
            //.baseUrl(url.toString())
            //.defaultCookie("cookieKey", "cookieValue")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            //.defaultUriVariables(Collections.singletonMap("url", "http://localhost:8080"))
            .build();
    }

    // public

    public fun load(url: URL) : Manifest {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);


        return this.client!!.get().uri(url.toString() + "/assets/manifest.json")
            .retrieve()
            .bodyToMono(Manifest::class.java).block()
    }
}
