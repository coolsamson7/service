package com.serious.registry;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component;
import com.serious.service.ComponentDescriptor;
import com.serious.service.ComponentRegistry;
import com.serious.service.ServiceAddress;
import org.springframework.cloud.client.ServiceInstance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Andreas Ernst
 */
public class LocalComponentRegistry  implements ComponentRegistry {
    // instance data

    Map<String, List<ServiceAddress>> services = new HashMap<>();

    // implement ComponentRegistry

    @Override
    public void startup(ComponentDescriptor<Component> descriptor) {
        List<ServiceAddress> addresses = services.computeIfAbsent(descriptor.getName(), k ->
                new ArrayList<>()
        );

        addresses.addAll(descriptor.getExternalAddresses());
    }

    @Override
    public void shutdown(ComponentDescriptor<Component> descriptor) {
        // noop
    }

    @Override
    public List<String> getServices() {
        return services.keySet().stream().toList();
    }

    @Override
    public List<ServiceInstance> getInstances(String service) {
        return services.get(service).stream()
                .map(address -> address.getServiceInstance())
                .collect(Collectors.toList());
    }
}

