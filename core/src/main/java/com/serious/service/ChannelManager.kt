package com.serious.service
/** @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.channel.ChannelCustomizer
import com.serious.service.exception.ServiceRuntimeException
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
    var channels: MutableMap<String, Channel> = ConcurrentHashMap()
    private var channelCustomizers: ArrayList<ChannelCustomizer<out Channel>> = ArrayList()

    @Value("\${service.root:com.serious}")
    lateinit var rootPackage: String

    // public

    fun registerChannelCustomizer(channelCustomizer: ChannelCustomizer<out Channel>) {
        channelCustomizers.add(channelCustomizer)
    }

    fun <T : ChannelCustomizer<out Channel>> getChannelCustomizers(channel: Channel): List<T> {
        //val componentInterface = ComponentDescriptor.descriptors.get(channel.component)!!.serviceInterface
        return channelCustomizers.filter { customizer -> customizer.channelClass.isAssignableFrom(channel.javaClass) /*&& customizer.isApplicable(componentInterface)*/ } as List<T>
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
        val key = channel.component + ":" + channel.name
        channels.remove(key)
    }

    fun make(component: String, address: ServiceAddress) : Channel {
        val key = component + ":" + address.channel

        var channel = channels[key]

        if (channel == null) {
            log.info("create channel for {}", address.toString())

            channel = channelFactories[address.channel]?.makeChannel(component, address)
            if (channel != null)
                channels[key] = channel
        }

        if ( channel != null)
            return channel
        else
            throw ServiceRuntimeException("could not create channel %s", address.channel)
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
