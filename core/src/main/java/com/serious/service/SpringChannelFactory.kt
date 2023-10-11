package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.spring.ChildBeanFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author Andreas Ernst
 */
public class SpringChannelFactory implements ChannelFactory {
    static Logger logger = LoggerFactory.getLogger(SpringChannelFactory.class);

    // instance data

    private final BeanDefinition beanDefinition;
    ApplicationContext applicationContext;

    // constructor

    public SpringChannelFactory(ApplicationContext applicationContext, BeanDefinition beanDefinition) {
        this.beanDefinition = beanDefinition;
        this.applicationContext = applicationContext;
    }

    // implement ChannelFactory

    @Override
    public Channel makeChannel(Class<com.serious.service.Component> componentClass, List<ServiceAddress> serviceAddresses) {
        logger.trace("make channel " + serviceAddresses.get(0).getChannel());

        //beanDefinition.getPropertyValues().addPropertyValue("addresses", serviceAddresses);

        DefaultListableBeanFactory beanFactory = new ChildBeanFactory((ConfigurableApplicationContext) applicationContext);

        String beanName = serviceAddresses.get(0).getServiceInstance().getInstanceId();

        beanFactory.registerBeanDefinition(beanName, beanDefinition);

        Channel channel = (Channel) beanFactory.getBean(beanName);

        // setup

        channel.setup(componentClass, serviceAddresses);

        // done

        return channel;
    }

}
