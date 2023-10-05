package com.serious.service.channel.rest;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.web.reactive.function.client.WebClient;

/**
 * A <code>Request</code> covers the technical protocol details for a single methoid call
 *
 * @author Andreas Ernst
 */
public class Request {
    // local classes

    interface ResponseHandler {
        Object handle(WebClient.ResponseSpec spec);
    }

    // instance data

    private final RequestBuilder.SpecOperation[] specs;
    private final ResponseHandler responseHandler;

    // constructor


    public Request(RequestBuilder.SpecOperation[] specs, ResponseHandler responseHandler) {
        this.specs = specs;
        this.responseHandler = responseHandler;
    }

    // private
    private WebClient.RequestHeadersSpec spec(Object... params) {
        WebClient.RequestHeadersSpec spec = null;
        for (RequestBuilder.SpecOperation operation : specs)
            spec = operation.build(spec, params);

        return spec;
    }

    // public

    Object execute(Object... args) {
        WebClient.RequestHeadersSpec requestHeadersSpec = spec(args);
        WebClient.ResponseSpec responseSpec = requestHeadersSpec.retrieve();

        return responseHandler.handle(responseSpec);
    }
}
