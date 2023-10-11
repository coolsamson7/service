package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.aopalliance.intercept.MethodInterceptor;

import java.lang.reflect.InvocationHandler;
import java.util.List;

/**
 * @author Andreas Ernst
 */
public interface Channel extends MethodInterceptor, InvocationHandler {
    ServiceAddress getPrimaryAddress();

    List<ServiceAddress> getAddresses();

    boolean needsUpdate(ServiceInstanceRegistry.Delta delta);

    void setup(Class<com.serious.service.Component> componentClass, List<ServiceAddress> serviceAddresses);
}
