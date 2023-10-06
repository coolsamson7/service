package com.serious.service.injections;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.injection.AbstractInjection;
import com.serious.injection.InjectorFactory;
import com.serious.lang.Keywords;
import com.serious.service.BaseDescriptor;
import com.serious.service.ComponentDescriptor;
import com.serious.service.ComponentManager;
import com.serious.service.Service;
import com.serious.service.annotations.InjectService;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;

/**
 * Special <code>Injector</code> that injects {@link Service}s into target objects based on a field
 * or method annotation of type {@link InjectService}.
 *
 * @author Andreas Ernst
 */
@Component()
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ServiceInjection extends AbstractInjection<Service, InjectService, Keywords> implements ApplicationContextAware {
    // instance data

    private ComponentManager componentManager;

    // constructor

    /**
     * Constructs a <code>ServiceInjection</code>
     */
    @Autowired
    public ServiceInjection(InjectorFactory injectorFactory) {
        super(InjectService.class);

        injectorFactory.registerInjection(this);
    }

    // implement AbstractInjection

    @Override
    public Service computeValue(Object targetObject, Class accessibleObjectType, AccessibleObject accessibleObject, InjectService annotation, Keywords context) {
        @SuppressWarnings("unchecked") Class<? extends Service> serviceInterface = (Class<? extends Service>) ((Field) accessibleObject).getType();

        if (annotation.preferLocal() && BaseDescriptor.forService(serviceInterface).local != null)
            return componentManager.acquireLocalService(serviceInterface);
        else {
            return componentManager.acquireService(serviceInterface, annotation.channels());
        }
    }

    // implement ApplicationContextAware

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        componentManager = applicationContext.getBean(ComponentManager.class);
    }
}

