package com.serious.service.channel.rest;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;

import java.util.ArrayList;
import java.util.Map;

/**
 * @author Andreas Ernst
 */
public class RequestBuilder<S extends WebClient.RequestHeadersSpec<S>> {
    // inner classes

    interface SpecOperation<S> {
        WebClient.RequestHeadersSpec build(S spec, Object... args);
    }

    // general stuff

    class Accept implements SpecOperation<S> {
        // instance data
        MediaType[] acceptableMediaTypes;

        // constructor
        Accept(MediaType... acceptableMediaTypes) {
            this.acceptableMediaTypes = acceptableMediaTypes;
        }

        // implement

        @Override
        public WebClient.RequestHeadersSpec build(S spec, Object... args) {
            return spec.accept(acceptableMediaTypes);
        }
    }

    // Methods

    class Get implements SpecOperation<S> {
        @Override
        public WebClient.RequestHeadersSpec build(S spec, Object... args) {
            return client.get();
        }
    }

    class Put implements SpecOperation<S> {
        @Override
        public WebClient.RequestHeadersSpec build(S spec, Object... args) {
            return client.put();
        }
    }

    class Delete implements SpecOperation<S> {
        @Override
        public WebClient.RequestHeadersSpec build(S spec, Object... args) {
            return client.delete();
        }
    }

    class Post implements SpecOperation<S> {
        @Override
        public WebClient.RequestHeadersSpec build(S spec, Object... args) {
            return client.post();
        }
    }

    class Body implements SpecOperation<WebClient.RequestBodySpec> {
        // instance data

        private final int index;

        // constructor

        Body(int index) {
            this.index = index;
        }

        // implement

        public WebClient.RequestHeadersSpec build(WebClient.RequestBodySpec spec, Object... args) {
            return spec.bodyValue(args[index]);
        }
    }

    class URI implements SpecOperation<WebClient.RequestHeadersUriSpec<?>> {
        // instance data

        private final String uri;
        private final Integer[] indizes;
        private final Map<String, Integer> requestParams;

        // constructor

        URI(String uri, Integer[] indizes, Map<String, Integer> requestParams) {
            this.uri = uri;
            this.indizes = indizes;
            this.requestParams = requestParams;
        }

        // override

        @Override
        public WebClient.RequestHeadersSpec build(WebClient.RequestHeadersUriSpec<?> spec, Object... args) {
            // extract args

            Object[] ids = new Object[indizes.length];

            for (int i = 0; i < ids.length; i++)
                ids[i] = args[indizes[i]];

            return spec.uri(uriBuilder -> {
                UriBuilder p = uriBuilder.path(uri);

                // add request params

                for (Map.Entry<String, Integer> entry : requestParams.entrySet())
                    p.queryParam(entry.getKey(), args[entry.getValue()]);

                // done

                return p.build(args);
            });
        }
    }

    // instance data

    ArrayList<SpecOperation<S>> operations = new ArrayList<>();
    WebClient client;

    // constructor

    RequestBuilder(WebClient client) {
        this.client = client;
    }

    // builder

    RequestBuilder<S> accept(MediaType... acceptableMediaTypes) {
        this.operations.add(new Accept(acceptableMediaTypes));

        return this;
    }

    // operations

    RequestBuilder<S> get() {
        this.operations.add(new Get());

        return this;
    }

    RequestBuilder<S> put() {
        this.operations.add(new Put());

        return this;
    }

    RequestBuilder<S> delete() {
        this.operations.add(new Delete());

        return this;
    }

    RequestBuilder<S> uri(String uri, Integer[] args, Map<String, Integer> requestParams) {
        this.operations.add((SpecOperation<S>) new URI(uri, args, requestParams));

        return this;
    }

    // post

    RequestBuilder<S> post() {
        this.operations.add(new Post());

        return this;
    }

    RequestBuilder<S> body(int index) {
        this.operations.add((SpecOperation<S>) new Body(index));

        return this;
    }
}