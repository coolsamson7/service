package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
public class ServiceDescriptor<T extends Service> extends BaseDescriptor<T> {
    // instance data

    public final ComponentDescriptor<? extends Component> componentDescriptor;

    // constructor

    public ServiceDescriptor(ComponentDescriptor<Component> componentDescriptor, Class<T> serviceInterface) {
        super(serviceInterface);

        ServiceInterface annotation = this.serviceInterface.getAnnotation(ServiceInterface.class);

        if (!annotation.name().isBlank())
            name = annotation.name();

        if (!annotation.description().isBlank())
            description = annotation.description();

        this.componentDescriptor = componentDescriptor;
    }

    // override

    public boolean isService() {
        return true;
    }

    public <T extends Component> ComponentDescriptor getComponentDescriptor() {
        return componentDescriptor;
    }

    // public

    public void report(StringBuilder builder) {
        builder
                .append("\t\t")
                .append(this.getName());

        if (local != null)
            builder.append("[local]");

        builder.append("\n");
    }
}