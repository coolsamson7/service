package com.serious.service.channel.rest;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ChannelManager;
import com.serious.service.RegisterChannel;
import com.serious.service.ServiceAddress;
import com.serious.service.channel.AbstractChannel;
import com.serious.service.channel.ChannelBuilder;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A <code>HttpChannel</code> covers the technical protocol for http rest calls via <code>WebClient</code>
 *
 * @author Andreas Ernst
 */
@RegisterChannel(protocol = "rest")
public class RestChannel extends AbstractChannel {
    // instance data

    private WebClient webClient;
    private final Map<Method, Request> requests = new ConcurrentHashMap<>();

    // constructor

    @Autowired
    public RestChannel(ChannelManager channelManager) {
        super(channelManager);
    }

    // private

    private Request getRequest(Method method) {
        Request request = requests.get(method);
        if (request == null) {
            requests.put(method, request = computeRequest(method));
        }

        return request;
    }

    private Request computeRequest(Method method) {
        return new MethodAnalyzer().request(webClient, method);
    }

    // implement Channel

    @Override
    public Object invoke(MethodInvocation invocation) {
        return getRequest(invocation.getMethod()).execute(invocation.getArguments());
    }

    // This method returns filter function which will log request data
    private static ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            System.out.println(clientRequest.method() + " " + clientRequest.url());
            clientRequest.headers().forEach((name, values) -> values.forEach(value -> System.out.println("\t" + name + "=" + value)));

            return Mono.just(clientRequest);
        });
    }

    @Override
    public void setup(Class<com.serious.service.Component> componentClass, List<ServiceAddress> serviceAddresses) {
        super.setup(componentClass, serviceAddresses);

        AbstractRestChannelBuilder channelBuilder = (AbstractRestChannelBuilder) channelManager.getChannelBuilder(RestChannel.class);

        WebClient.Builder builder = WebClient.builder();

        // add some defaults

        builder
                .baseUrl(serviceAddress.getUri().toString())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

        // custom stuff

        if ( channelBuilder != null && channelBuilder.isApplicable(componentClass))
            builder = channelBuilder.build(builder);

        // done

        webClient = builder.build();
    }
}
