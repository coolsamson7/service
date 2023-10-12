package com.serious.service

import com.serious.spring.ChildBeanFactory
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ApplicationContext
import org.springframework.context.ConfigurableApplicationContext

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
class SpringChannelFactory // constructor
    (
    var applicationContext: ApplicationContext, // instance data
    private val beanDefinition: BeanDefinition
) : ChannelFactory {
    // implement ChannelFactory
    override fun makeChannel(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>?): Channel? {
        logger.trace("make channel " + serviceAddresses!![0].channel)

        //beanDefinition.getPropertyValues().addPropertyValue("addresses", serviceAddresses);
        val beanFactory: DefaultListableBeanFactory =
            ChildBeanFactory((applicationContext as ConfigurableApplicationContext))
        val beanName = serviceAddresses[0].serviceInstance!!.instanceId
        beanFactory.registerBeanDefinition(beanName, beanDefinition)
        val channel = beanFactory.getBean(beanName) as Channel

        // setup
        channel.setup(componentClass, serviceAddresses)

        // done
        return channel
    }

    companion object {
        var logger = LoggerFactory.getLogger(SpringChannelFactory::class.java)
    }
}
