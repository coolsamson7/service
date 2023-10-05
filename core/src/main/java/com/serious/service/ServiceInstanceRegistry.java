package com.serious.service;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * @author Andreas Ernst
 */
@Component
@Slf4j
public class ServiceInstanceRegistry {
    // instance data
    @Autowired
    ChannelManager channelManager;
    @Autowired
    ComponentRegistry componentRegistry;
    private Map<String, List<ServiceInstance>> serviceInstances = new ConcurrentHashMap<>();

    // public

    public void startup() {
        // fill initial services

        for (ComponentDescriptor componentDescriptor : ComponentDescriptor.descriptors) {
            List<ServiceInstance> instances = componentRegistry.getInstances(componentDescriptor.getName());

            serviceInstances.put(componentDescriptor.getName(), instances);
        }
    }

    List<ServiceAddress> getServiceAddresses(ComponentDescriptor<?> componentDescriptor, String... preferredChannels) {
        List<ServiceInstance> instances = this.serviceInstances.get(componentDescriptor.getName());

        String channelName = null;

        if (instances != null && !instances.isEmpty()) {
            if ( preferredChannels.length == 0) {
                String channels[] = instances.get(0).getMetadata().get("channels").split(",");
                channelName = channels[0];
            }
            else {
                for (ServiceInstance instance : instances) {
                    for ( String channel : instance.getMetadata().get("channels").split(","))
                        if ( channelName == null && Arrays.asList(preferredChannels).contains(channel) ) {
                            channelName = channel;
                            break;
                        }

                    if  (channelName != null)
                        break;
                } // for
            }
        }

        if ( instances != null && channelName != null) {
            String finalChannelName = channelName;
            return instances.stream()
                    .filter(serviceInstance ->  Arrays.asList(serviceInstance.getMetadata().get("channels").split(",")).contains(finalChannelName))
                    .map(serviceInstance -> new ServiceAddress(finalChannelName, serviceInstance))
                    .collect(Collectors.toList());
        }
        else return null;
    }

    public void report() {
        StringBuilder builder = new StringBuilder();

        builder.append("Service Instances").append("\n");

        for (String service : serviceInstances.keySet()) {
            List<ServiceInstance> instances = serviceInstances.get(service);

            builder.append("Service ").append(service).append("\n");

            for (ServiceInstance instance : instances) {
                builder
                        .append("\t").append(instance.getUri())
                        .append("\n");
            } // for
        } // for

        System.out.println(builder.toString());
    }

    public void update(Map<String, List<ServiceInstance>> newMap) {
        // recheck missing channels

        ChannelInvocationHandler.recheck(channelManager, newMap);

        // new map

        this.serviceInstances = newMap;
    }
}
