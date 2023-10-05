package com.serious.injection;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.lang.Keywords;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.BeanPostProcessor;

/**
 * @author Andreas Ernst
 */
//@Component
public class InjectorFactory implements FactoryBean, BeanPostProcessor {
    // static data

    private static final Injector INSTANCE = new Injector();

    // constructor

    public InjectorFactory(Injection... injections) {
        for (Injection injection : injections)
            INSTANCE.registerInjection(injection);
    }

    // public

    public void registerInjection(Injection injection) {
        INSTANCE.registerInjection(injection);
    }

    // implement FactoryBean

    @Override
    public Object getObject() throws Exception {
        return INSTANCE;
    }

    @Override
    public Class getObjectType() {
        return Injector.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

    // implement BeanPostProcessor

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        INSTANCE.inject(bean, Keywords.NONE);

        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
}
