package com.serious.service

import com.serious.service.channel.ChannelBuilder
import com.serious.util.Exceptions
import jakarta.annotation.PostConstruct
import lombok.extern.slf4j.Slf4j
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.Value
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.type.filter.AnnotationTypeFilter
import java.util.concurrent.ConcurrentHashMap

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@org.springframework.stereotype.Component
@Slf4j
class ChannelManager : ApplicationContextAware {
    // local classes
    internal class ChannelProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(RegisterChannel::class.java, false))
        }
    }

    // instance data

    @JvmField
    var applicationContext: ApplicationContext? = null
    @JvmField
    var channelFactories: MutableMap<String, ChannelFactory> = HashMap()
    var channels: MutableMap<ServiceAddress?, Channel> = ConcurrentHashMap()
    var channelBuilder: MutableMap<Class<out Channel?>, ChannelBuilder<*>> = HashMap()

    @Value("\${service.root:com.serious}")
    var rootPackage: String? = null

    // public
    fun registerChannelBuilder(channelBuilder: ChannelBuilder<*>) {
        this.channelBuilder[channelBuilder.channelClass()] = channelBuilder
    }

    fun <T : Channel?> getChannelBuilder(channel: Class<out T?>): ChannelBuilder<T> {
        return channelBuilder[channel] as ChannelBuilder<T>
    }

    @PostConstruct
    fun scan() {
        val provider = ChannelProvider()
        val beans = provider.findCandidateComponents(rootPackage)
        for (bean in beans) {
            try {
                register(bean)
            } catch (e: ClassNotFoundException) {
                Exceptions.throwException(e)
            }
        }

        // done
        report()
    }

    fun report() {
        val builder = StringBuilder()
        builder.append("channels:\n")
        for (protocol in channelFactories.keys) builder.append("\t").append(protocol).append("\n")
        //TODO KOTLIN ChannelManager.log.info(builder.toString())
    }

    @Throws(ClassNotFoundException::class)
    fun register(definition: BeanDefinition) {
        val clazz = Class.forName(definition.beanClassName)
        val spec = clazz.getAnnotation(RegisterChannel::class.java) as RegisterChannel
        //TODO KOTLIN ChannelManager.log.info("register channel {}", definition.beanClassName)
        channelFactories[spec.value] = SpringChannelFactory(applicationContext!!, definition)
    }

    fun removeChannel(channel: Channel) {
        channels.remove(channel.getPrimaryAddress())
    }

    fun make(
        componentClass: Class<out Component>,
        channelName: String,
        serviceAddresses: List<ServiceAddress>
    ): Channel? {
        val primaryServiceAddress = serviceAddresses[0]
        var channel = channels[primaryServiceAddress]
        if (channel == null) {
            //TODO KOTLIN ChannelManager.log.info("create channel for {}", primaryServiceAddress.toString())
            val channelFactory = channelFactories[channelName]
            channel = channelFactory?.makeChannel(componentClass, serviceAddresses)
            if (channel != null) channels[primaryServiceAddress] = channel
        }
        return channel
    }

    // implement ApplicationContextAware
    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.applicationContext = applicationContext
    }
}
