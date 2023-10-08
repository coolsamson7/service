package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.web.bind.annotation.GetMapping;

import java.lang.reflect.Method;
import java.util.*;

/**
 * @author Andreas Ernst
 */
public class ComponentDescriptor<T extends Component> extends BaseDescriptor<T> {
    // static data

    public static List<ComponentDescriptor<?>> descriptors = new ArrayList<>();

    // instance data

    public String health;
    ComponentManager componentManager;

    List<ServiceDescriptor> services = new LinkedList<>();

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

        for (ServiceDescriptor<?> serviceDescriptor : services)
            serviceDescriptor.registerBeans(registry);
    }

    // private

    private void analyze() {
        ComponentInterface annotation = this.serviceInterface.getAnnotation(ComponentInterface.class);

        for (Class<? extends Service> service : annotation.services())
            registerService(service);
    }

    private <T extends Service> void registerService(Class<T> service) {
        services.add(new ServiceDescriptor<T>((ComponentDescriptor<Component>) this, service));
    }

    // public

    public void report(StringBuilder builder) {
        builder
                .append("component ")
                .append(this.serviceInterface.getName()).append("\n");

        if (hasImplementation()) {
            builder.append("\taddress:\n");

            for (ServiceAddress externalAddress : getExternalAddresses())
                builder.append("\t\t").append(externalAddress.toString()).append("\n");
        }

        // services

        builder.append("\tservices:").append("\n");

        for (ServiceDescriptor<?> serviceDescriptor : services)
            serviceDescriptor.report(builder);
    }

    public List<ServiceAddress> getExternalAddresses() {
        return local != null ? local.getAddresses() : null;
    }
}