package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.cloud.client.ServiceInstance;

import java.util.List;

/**
 * @author Andreas Ernst
 */
public interface ComponentRegistry {
    void startup(ComponentDescriptor<com.serious.service.Component> descriptor);

    void shutdown(ComponentDescriptor<com.serious.service.Component> descriptor);

    List<String> getServices();

    List<ServiceInstance> getInstances(String service);
}
