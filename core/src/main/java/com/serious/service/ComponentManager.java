package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.channel.MissingChannel;
import com.serious.service.exception.ServiceRuntimeException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import java.lang.reflect.Proxy;
import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The {@link ComponentLocator} has already scanned and registered the corresponding descriptor and beans.
 * In a postConstruct phase the following logic is executed
 *
 * <ul>
 *     <li>component descriptors are copied fom the locator </li>
 *     <li>local implementations are instantiated </li>
 *     <li>local components are published to the registry </li>
 *     <li>local components start up</li>
 * </ul>
 */
@Component
public class ComponentManager implements ApplicationContextAware {
    // static data

    public static Logger log = LoggerFactory.getLogger(ComponentManager.class);

    // instance data

    ApplicationContext applicationContext;
    ComponentRegistry componentRegistry;
    ChannelManager channelManager;
    ServiceInstanceRegistry serviceInstanceRegistry;
    public Map<String, ComponentDescriptor<com.serious.service.Component>> componentDescriptors = new HashMap<>();
    Map<String, Service> proxies = new ConcurrentHashMap<>();
    @Value("${server.port}")
    String port;

    // constructor
    @Autowired
    ComponentManager(ComponentRegistry componentRegistry, ChannelManager channelManager, ServiceInstanceRegistry serviceInstanceRegistry) {
        this.componentRegistry = componentRegistry;
        this.channelManager = channelManager;
        this.serviceInstanceRegistry = serviceInstanceRegistry;
    }

    // lifecycle

    @PostConstruct
    void startup() {
        AbstractComponent.port = port;

        // register components

        for (ComponentDescriptor<com.serious.service.Component> componentDescriptor : ComponentLocator.components)
            addComponentDescriptor(componentDescriptor);

        ComponentLocator.components.clear();

        // create local component and service implementations

        BaseDescriptor.createImplementations(applicationContext);

        // publish local components

        for (ComponentDescriptor<com.serious.service.Component> componentDescriptor : componentDescriptors.values())
            if (componentDescriptor.hasImplementation())
                componentRegistry.startup(componentDescriptor);

        // force update of the service instance registry

        serviceInstanceRegistry.startup();

        // startup

        for (ComponentDescriptor<?> componentDescriptor : componentDescriptors.values())
            if (componentDescriptor.hasImplementation()) {
                log.info("startup {}", componentDescriptor.getName());

                componentDescriptor.local.startup();
            }

        // report

        report();
    }

    @PreDestroy
    void shutdown() {
        for (ComponentDescriptor<com.serious.service.Component> componentDescriptor : componentDescriptors.values())
            if (componentDescriptor.hasImplementation()) {
                log.info("shutdown {}", componentDescriptor.getName());

                componentDescriptor.local.shutdown();

                componentRegistry.shutdown(componentDescriptor);
            }
    }

    // private

    void addComponentDescriptor(ComponentDescriptor<com.serious.service.Component> descriptor) {
        componentDescriptors.put(descriptor.getName(), descriptor);

        descriptor.componentManager = this;
    }

    void report() {
        StringBuilder builder = new StringBuilder();

        for (ComponentDescriptor<?> componentDescriptor : componentDescriptors.values())
            componentDescriptor.report(builder);

        System.out.println(builder);
    }

    // public

    public <T extends Service> T acquireLocalService(Class<T> serviceClass) {
        BaseDescriptor<T> descriptor = BaseDescriptor.forService(serviceClass);

        if (descriptor.hasImplementation())
            return acquireService(descriptor, Collections.singletonList(new ServiceAddress("local", (URI) null)));
        else
            throw new ServiceRuntimeException("cannot create local service, implementation missing");
    }

    public <T extends Service> T acquireService(Class<T> serviceClass, String... channels) {
        BaseDescriptor<T> descriptor = BaseDescriptor.forService(serviceClass);

        List<ServiceAddress> serviceAddresses = getServiceAddresses(descriptor.getComponentDescriptor(), channels);
        if ( serviceAddresses == null || serviceAddresses.isEmpty())
            throw new ServiceRuntimeException("no service instances for " + descriptor.getComponentDescriptor().getName() + (channels.length > 0 ? " channels..." : ""));

        return acquireService(descriptor, serviceAddresses);
    }

    public <T extends Service> T acquireService(BaseDescriptor<T> descriptor, List<ServiceAddress> addresses) {
        Class<T> serviceClass = descriptor.serviceInterface;

        String channel = addresses != null && !addresses.isEmpty() ? addresses.get(0).getChannel() : "-";

        String key = serviceClass.getName() + ":" + channel;
        T service = (T) proxies.get(key);
        if (service == null) {
            log.info("create proxy for {}.{}", serviceClass.getName(), channel);

            if (channel.equals("local"))
                proxies.put(key, service = (T) Proxy.newProxyInstance(serviceClass.getClassLoader(), new Class[]{serviceClass}, (proxy, method, args) -> method.invoke(descriptor.local, args)));
            else {
                ChannelInvocationHandler channelInvocationHandler = ChannelInvocationHandler.forComponent(descriptor.getComponentDescriptor(), channel, addresses); // TODO: pass addresses

                proxies.put(key, service = (T) Proxy.newProxyInstance(serviceClass.getClassLoader(), new Class[]{serviceClass}, channelInvocationHandler));
            }
        } // if

        return service;
    }

    public List<ServiceAddress> getServiceAddresses(ComponentDescriptor<?> componentDescriptor, String... channels) {
        return serviceInstanceRegistry.getServiceAddresses(componentDescriptor, channels);
    }

    public Channel getChannel(BaseDescriptor<?> descriptor, String channelName, List<ServiceAddress> serviceAddresses) {
        Channel channel = (serviceAddresses != null && !serviceAddresses.isEmpty()) ? makeChannel(descriptor.getComponentDescriptor().serviceInterface, channelName, serviceAddresses) : null;

        return channel != null ? channel : new MissingChannel(channelManager, descriptor.getComponentDescriptor().getName());
    }

    public Channel makeChannel(Class<com.serious.service.Component> componentClass, String channel, List<ServiceAddress> serviceAddresses) {
        return channelManager.make(componentClass, channel, serviceAddresses);
    }

    // implement ApplicationContextAware

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
