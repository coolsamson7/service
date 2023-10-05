package com.serious.service;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.util.Exceptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.ApplicationContext;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * @author Andreas Ernst
 */
public class BaseDescriptor<T extends Service> {
    // static data

    static Logger logger = LoggerFactory.getLogger(BaseDescriptor.class);

    static Map<Class<? extends Service>, BaseDescriptor<?>> descriptors = new HashMap<>();

    static Map<BaseDescriptor<Service>, BeanDefinition> implementingBeans = new HashMap<>();

    // static methods

    static Class class4Name(String className) {
        try {
            return Class.forName(className);
        }
        catch (ClassNotFoundException e) {
            Exceptions.throwException(e);
            return null;
        }
    }

    public static void rememberImplementation(BaseDescriptor<Service> descriptor, BeanDefinition bean) {
        implementingBeans.put(descriptor, bean);
    }

    public static void createImplementations(ApplicationContext applicationContext) {
        // fetch instances

        for (Map.Entry<BaseDescriptor<Service>, BeanDefinition> entry : implementingBeans.entrySet()) {
            BaseDescriptor<Service> descriptor = entry.getKey();

            logger.info("create implementation for {}", descriptor.getName());

            descriptor.local = applicationContext.getBean(descriptor.serviceInterface);
        }

        implementingBeans.clear();
    }

    public static <T extends Service> BaseDescriptor<T> forService(Class<T> serviceClass) {
        return (BaseDescriptor<T>) descriptors.get(serviceClass);
    }

    // instance data

    public Class<T> serviceInterface;
    public T local;

    // constructor

    protected BaseDescriptor(Class<T> serviceInterface) {
        this.serviceInterface = serviceInterface;

        descriptors.put(serviceInterface, this);
    }

    // public

    public void registerBeans(DefaultListableBeanFactory registry) {
        // let's look for local implementations

        for (String name : registry.getBeanNamesForType(serviceInterface))
            rememberImplementation((BaseDescriptor<Service>) this, registry.getBeanDefinition(name));
    }

    public boolean isService() {
        return false;
    }

    public <T extends Component> ComponentDescriptor<T> getComponentDescriptor() {
        return null;
    }

    public URI getUri() {
        return null;
    }

    public String getName() {
        return serviceInterface.getName();
    }

    public boolean hasImplementation() {
        return local != null || implementingBeans.get(this) != null;
    }

    // override Object

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseDescriptor<?> that = (BaseDescriptor<?>) o;
        return Objects.equals(serviceInterface, that.serviceInterface);
    }

    @Override
    public int hashCode() {
        return Objects.hash(serviceInterface);
    }
}
