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

import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * @author Andreas Ernst
 */
@Component
@Slf4j
public class ServiceInstanceRegistry {
    // local classes

    public static class Delta {
        // instance data

        Map<String,List<ServiceInstance>> deletedInstances = new HashMap<>();
        Map<String,List<ServiceInstance>> addedInstances = new HashMap<>();

        // private

        List<ServiceInstance> getDeletedInstances(String service) {
            return deletedInstances.computeIfAbsent(service, k -> new LinkedList<>());
        }

        List<ServiceInstance> getAddedInstances(String service) {
            return addedInstances.computeIfAbsent(service, k -> new LinkedList<>());
        }

        // public

        public boolean isDeleted(ServiceInstance instance) {
            for (List<ServiceInstance> instances : deletedInstances.values())
                if ( instances.contains(instance))
                    return true;

            return false;
        }

        public void deletedServices(String service, List<ServiceInstance> instances) {
            getDeletedInstances(service).addAll(instances);
        }
        public void deletedService(String service, ServiceInstance instance) {
            getDeletedInstances(service).add(instance);
        }

        public void addedService(String service, ServiceInstance instance) {
            getAddedInstances(service).add(instance);
        }
        public void addedServices(String service, List<ServiceInstance> instances) {
            getAddedInstances(service).addAll(instances);
        }

        public boolean isEmpty() {
            return addedInstances.isEmpty() && deletedInstances.isEmpty();
        }

        public void report() {
            for ( String service : deletedInstances.keySet())
                for (ServiceInstance instance : deletedInstances.get(service))
                    System.out.println("delete " + service + " instance " + instance.toString());

            for ( String service : addedInstances.keySet())
                for (ServiceInstance instance : addedInstances.get(service))
                    System.out.println("added " + service + " instance " + instance.toString());
        }
    }

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

    //


    private List<ServiceAddress> extractAddresses(String channels) {
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

    private List<ServiceInstance> getInstances(ComponentDescriptor<?> componentDescriptor) {
        List<ServiceInstance> instances = this.serviceInstances.get(componentDescriptor.getName());

        return instances != null ? instances : new ArrayList<>();
    }
    //

    List<ServiceAddress> getServiceAddresses(ComponentDescriptor<?> componentDescriptor, String... preferredChannels) {
        List<ServiceInstance> instances = getInstances(componentDescriptor);
        Map<ServiceInstance, List<ServiceAddress>> addresses = new HashMap<>();

        // extract addresses

        for ( ServiceInstance instance : instances)
            addresses.put(instance, extractAddresses(instance.getMetadata().get("channels")));

        // figure out a matching channel

        String channelName = null;
        if (!instances.isEmpty()) {
            if (preferredChannels.length == 0) {
                channelName = addresses.get(instances.get(0)).get(0).getChannel();
            }
            else {
                for (ServiceInstance instance : instances) {
                    for ( ServiceAddress address : addresses.get(instance))
                        if ( channelName == null && Arrays.asList(preferredChannels).contains(address.getChannel()) ) {
                            channelName = address.getChannel();
                            break;
                        }

                    if  (channelName != null)
                        break;
                } // for
            }
        }

        if (channelName != null) {
            String finalChannelName = channelName;

            return instances.stream()
                    .filter(serviceInstance ->  addresses.get(serviceInstance).stream().anyMatch(address -> address.getChannel().equals(finalChannelName)))
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

        System.out.println(builder);
    }



    private Delta computeDelta(Map<String, List<ServiceInstance>> oldMap, Map<String, List<ServiceInstance>> newMap) {
        Delta delta = new Delta();

        Set<String> oldKeys = oldMap.keySet();
        for (String service : oldKeys) {
            if (!newMap.containsKey(service))
                delta.deletedServices(service, oldMap.get(service));//System.out.println("deleted service " + service);

            else {
                // check instances

                Map<String, ServiceInstance> oldInstances = new HashMap<>();
                Map<String, ServiceInstance> newInstances = new HashMap<>();

                for ( ServiceInstance serviceInstance : oldMap.get(service))
                    oldInstances.put(serviceInstance.getInstanceId(), serviceInstance);

                for ( ServiceInstance serviceInstance : newMap.get(service))
                    newInstances.put(serviceInstance.getInstanceId(), serviceInstance);

                //oldMap.get(service).stream().peek(serviceInstance -> oldInstances.put(serviceInstance.getInstanceId(), serviceInstance));
                //newMap.get(service).stream().peek(serviceInstance -> newInstances.put(serviceInstance.getInstanceId(), serviceInstance));

                // compare maps

                Set<String> oldInstanceIds = oldInstances.keySet();
                for (String instanceId : oldInstanceIds)
                    if (!newInstances.containsKey(instanceId))
                        delta.deletedService(service, oldInstances.get(instanceId));//System.out.println("deleted service instance " + instanceId);

                for (String instanceId : newInstances.keySet())
                    if (!oldInstanceIds.contains(instanceId))
                        delta.addedService(service, newInstances.get(instanceId));//System.out.println("new service instance " + instanceId);
            }
        }

        for (String service : newMap.keySet())
            if (!oldMap.containsKey(service))
                delta.addedServices(service, newMap.get(service));//System.out.println("new service " + service);

        return delta;
    }

    public void update(Map<String, List<ServiceInstance>> newMap) {
        Delta delta = computeDelta(this.serviceInstances , newMap);

        if (!delta.isEmpty()) {
            delta.report();

            // recheck missing channels

            ChannelInvocationHandler.recheck(channelManager, delta);
        }

        // new map

        this.serviceInstances = newMap;
    }
}
