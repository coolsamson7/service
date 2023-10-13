package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.spring.ChildBeanFactory
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.support.ChildBeanDefinition
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationListener
import org.springframework.context.ConfigurableApplicationContext

 /**
 * Special [ChannelFactory] that utilizes spring to create instances of recorded [BeanDefinition]
 */
class SpringChannelFactory(var channelManager: ChannelManager, private val beanDefinition: BeanDefinition) : ChannelFactory {
    // private

    private val applicationContext : ConfigurableApplicationContext
        get() = channelManager.applicationContext!! as ConfigurableApplicationContext

    // implement ChannelFactory
    override fun makeChannel(componentClass: Class<out Component>, address: ServiceAddress): Channel {
        logger.trace("make channel " + address.channel)

        val beanFactory: DefaultListableBeanFactory = ChildBeanFactory(applicationContext)
        val beanName = address.channel

        val constructorArgumentValues = beanDefinition.constructorArgumentValues

        constructorArgumentValues.addIndexedArgumentValue(0, channelManager)
        constructorArgumentValues.addIndexedArgumentValue(1, componentClass)
        constructorArgumentValues.addIndexedArgumentValue(2, address)

        beanFactory.registerBeanDefinition(beanName, beanDefinition)

        val channel = beanFactory.getBean(beanName) as Channel

        // setup

        channel.setup()

        // done

        return channel
    }

    companion object {
        var logger = LoggerFactory.getLogger(SpringChannelFactory::class.java)
    }
}
