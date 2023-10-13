package com.serious.service
/** @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.channel.ChannelBuilder
import jakarta.annotation.PostConstruct
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.Value
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.type.filter.AnnotationTypeFilter
import java.util.concurrent.ConcurrentHashMap

/**
 * A <code>ChannelManager</code> is responsible for the lifecycle of [Channel]s.
 */
@org.springframework.stereotype.Component
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
    var channels: MutableMap<ServiceAddress, Channel> = ConcurrentHashMap()
    private var channelBuilder: MutableMap<Class<out Channel>, MutableList<ChannelBuilder<out Channel>>> = HashMap()

    @Value("\${service.root:com.serious}")
    lateinit var rootPackage: String

    // public

    fun registerChannelBuilder(channelBuilder: ChannelBuilder<*>) {
        val builders = this.channelBuilder.computeIfAbsent(channelBuilder.channelClass()) {_ -> mutableListOf() }
        builders.add(channelBuilder)
    }

    fun getChannelBuilders(channel: Class<out Channel>): MutableList<ChannelBuilder<out Channel>> {
        return channelBuilder.computeIfAbsent(channel) {_ -> mutableListOf() }
    }

    @PostConstruct
    fun scan() {
        val provider = ChannelProvider()
        val beans = provider.findCandidateComponents(rootPackage)
        for (bean in beans)
            register(bean)

        // done

        report()
    }

    fun report() {
        val builder = StringBuilder()

        builder.append("channels:\n")
        for (protocol in channelFactories.keys)
            builder.append("\t").append(protocol).append("\n")

        log.info(builder.toString())
    }

    @Throws(ClassNotFoundException::class)
    fun register(definition: BeanDefinition) {
        val clazz = Class.forName(definition.beanClassName)
        val spec = clazz.getAnnotation(RegisterChannel::class.java) as RegisterChannel

        log.info("register channel {}", definition.beanClassName)

        channelFactories[spec.value] = SpringChannelFactory(this, definition)
    }

    fun removeChannel(channel: Channel) {
        channels.remove(channel.getAddress())
    }

    fun make(componentClass: Class<out Component>, address: ServiceAddress) : Channel {
        var channel = channels[address]

        if (channel == null) {
            log.info("create channel for {}", address.toString())

            channel = channelFactories[address.channel]?.makeChannel(componentClass, address)
            if (channel != null)
                channels[address] = channel
        }
// TODOD !!
        return channel!!
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.applicationContext = applicationContext
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(ChannelManager::class.java)
    }
}
