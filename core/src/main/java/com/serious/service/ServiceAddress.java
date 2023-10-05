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
import java.util.Objects;

/**
 * @author Andreas Ernst
 */
@Getter
public class ServiceAddress {
    // instance data

    private String channel;
    private URI uri;
    private ServiceInstance serviceInstance;

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
        this.uri = instance.getUri();
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
                    .append("[channel: ").append(this.channel)
                    .append(" uri: ").append(this.uri.toString()).append("]");
        }
        else builder.append("-");

        return builder.toString();
    }
}
