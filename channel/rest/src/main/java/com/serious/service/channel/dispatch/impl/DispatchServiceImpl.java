package com.serious.service.channel.dispatch.impl;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ComponentManager;
import com.serious.service.Service;
import com.serious.service.channel.dispatch.DispatchChannel;
import com.serious.service.channel.dispatch.DispatchService;
import com.serious.service.channel.dispatch.MethodCache;
import com.serious.service.channel.dispatch.ServiceRequest;
import com.serious.util.Exceptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author Andreas Ernst
 */
@RestController
public class DispatchServiceImpl implements DispatchService {
    // instance data

    @Autowired
    ComponentManager componentManager;
    @Autowired
    MethodCache methodCache;

    // private

    private Class<Service> class4Name(String className) {
        try {
            return (Class<Service>)Class.forName(className);
        }
        catch (ClassNotFoundException e) {
            Exceptions.throwException(e);
            return null;
        }
    }

    // implement

    @PostMapping("/dispatch")
    @ResponseBody
    public String dispatch(@RequestBody String request) {
        byte[] bytes = DispatchChannel.decodeFromString(request);
        ServiceRequest serviceRequest = (ServiceRequest) DispatchChannel.decodeObject(bytes);

        Class<Service> serviceClass = class4Name(serviceRequest.service);
        Service service = componentManager.acquireLocalService(serviceClass);

        Method method = methodCache.getMethod(serviceClass, serviceRequest.method);

        //System.out.println("dispatch " + serviceRequest.service + "." + method.getName());

        Object result = null;
        try {
            result = method.invoke(service, serviceRequest.arguments);

            return DispatchChannel.encodeAsString(DispatchChannel.encodeObject(result));
        }
        catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
        catch (InvocationTargetException e) {
            throw new RuntimeException(e);
        }
    }
}
