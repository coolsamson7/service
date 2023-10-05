package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.web.bind.annotation.GetMapping;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Andreas Ernst
 */
public class ComponentDescriptor<T extends Component> extends BaseDescriptor<T> {
    // static data

    public static List<ComponentDescriptor<?>> descriptors = new ArrayList<>();

    // instance data

    public String[] channels = {};

    public String health;
    ComponentManager componentManager;
    public static Map<String, ServiceDescriptor<?>> services = new HashMap<>();

    // constructor

    public ComponentDescriptor(Class<T> componentInterface) {
        super(componentInterface);

        descriptors.add(this);

        analyze();
    }

    // public

    public <T extends Component> ComponentDescriptor getComponentDescriptor() {
        return this;
    }

    public void registerBeans(DefaultListableBeanFactory registry) {
        super.registerBeans(registry);

        // fetch channels

        if (implementingBeans.get(this) != null) {
            Class componentClass = class4Name(implementingBeans.get(this).getBeanClassName());

            ComponentHost host = (ComponentHost) componentClass.getAnnotation(ComponentHost.class);

            // channels

            channels = host.channels();

            // health

            health = host.health();

            // patch the request mapping for the getHealth()

            try {
                Method getHealth = componentClass.getMethod("getHealth");

                if (getHealth.getAnnotation(GetMapping.class) != null) {
                    GetMapping getMapping = getHealth.getAnnotation(GetMapping.class);

                    //Annotations.changeAnnotationValue(getMapping, "value", new String[]{health});
                }
            }
            catch (NoSuchMethodException e) {
                // ignore
            }
        }

        // services

        for (ServiceDescriptor<?> serviceDescriptor : services.values())
            serviceDescriptor.registerBeans(registry);
    }

    // private

    private void analyze() {
        ComponentInterface annotation = this.serviceInterface.getAnnotation(ComponentInterface.class);

        for (Class<? extends Service> service : annotation.services())
            registerService(service);
    }

    private <T extends Service> void registerService(Class<T> service) {
        services.put(service.getName(), new ServiceDescriptor<T>((ComponentDescriptor<Component>) this, service));
    }

    // public

    public void report(StringBuilder builder) {
        builder
                .append("component ")
                .append(this.serviceInterface.getName()).append("\n")
                //TODO .append("\taddress: ").append(channel != null ? channel.getAddress().toString() : "-").append("\n")
                .append("\tchannels:");

        for (String channel : channels)
            builder.append(" ").append(channel);

        builder.append("\n");

        // services

        builder.append("\tservices:").append("\n");

        for (ServiceDescriptor<?> serviceDescriptor : services.values())
            serviceDescriptor.report(builder);
    }
}