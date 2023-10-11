package com.serious.service;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.springframework.cloud.client.ServiceInstance;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author Andreas Ernst
 */
@Getter
public class ServiceAddress {
    // static methods

    private static List<ServiceAddress> extractAddresses(String channels) {
        return  Arrays.stream(channels.split(","))
                .map(channel -> {
                    int lparen = channel.indexOf("(");
                    int rparen = channel.indexOf(")");

                    String protocol = channel.substring(0, lparen);
                    URI uri = URI.create(channel.substring(lparen + 1, rparen));

                    return new ServiceAddress(protocol, uri);
                })
                .collect(Collectors.toList());
    }

    private static ServiceAddress getAddress(String channel, ServiceInstance instance) {
        List<ServiceAddress> addresses = extractAddresses(instance.getMetadata().get("channels"));

        return addresses.stream().filter(address -> address.getChannel().equals(channel)).findFirst().orElse(null);
    }

    // instance data

    public String channel;
    private URI uri;
    public ServiceInstance serviceInstance;

    // constructor

    public ServiceAddress() {
    }

    public ServiceAddress(String channel, URI uri) {
        this.channel = channel;
        this.uri = uri;
    }

    public ServiceAddress(String channel, ServiceInstance instance) {
        this.channel = channel;
        this.serviceInstance = instance;
        this.uri = getAddress(channel, instance).getUri();//instance.getUri();
    }

    // override Object


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceAddress that)) return false;
        return Objects.equals(channel, that.channel) && Objects.equals(uri, that.uri);
    }

    @Override
    public int hashCode() {
        return Objects.hash(channel, uri);
    }

    public String toString() {
        StringBuilder builder = new StringBuilder();

        if ( channel != null) {
            builder
                    .append(this.channel).append("(")
                    .append(this.uri.toString()).append(")");
        }
        else builder.append("-");

        return builder.toString();
    }
}
