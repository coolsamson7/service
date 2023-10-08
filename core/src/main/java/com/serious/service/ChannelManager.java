package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.channel.ChannelBuilder;
import com.serious.util.Exceptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Andreas Ernst
 */
@Component
@Slf4j
public class ChannelManager implements ApplicationContextAware {
    // local classes

    static class ChannelProvider extends ClassPathScanningCandidateComponentProvider {

        public ChannelProvider() {
            super(false);

            addIncludeFilter(new AnnotationTypeFilter(RegisterChannel.class, false));
        }
    }

    // instance data

    ApplicationContext applicationContext;
    Map<String, ChannelFactory> channelFactories = new HashMap<>();
    Map<ServiceAddress, Channel> channels = new ConcurrentHashMap<>();

    Map<Class<? extends Channel>, ChannelBuilder> channelBuilder = new HashMap<>();

    @Value("${service.root:com.serious}")
    String rootPackage;

    // public

    public void registerChannelBuilder(ChannelBuilder channelBuilder) {
        this.channelBuilder.put(channelBuilder.channelClass(), channelBuilder);
    }

    public <T extends Channel> ChannelBuilder<T> getChannelBuilder(Class<T> channel) {
        return this.channelBuilder.get(channel);
    }

    @PostConstruct
    void scan() {
        ChannelProvider provider = new ChannelProvider();

        Set<BeanDefinition> beans = provider.findCandidateComponents(rootPackage);

        for (BeanDefinition bean : beans) {
            try {
                this.register(bean);
            }
            catch (ClassNotFoundException e) {
                Exceptions.throwException(e);
            }
        }

        // done

        report();
    }

    void report() {
        StringBuilder builder = new StringBuilder();

        builder.append("channels:\n");
        for (String protocol : channelFactories.keySet())
            builder.append("\t").append(protocol).append("\n");

        log.info(builder.toString());
    }

    void register(BeanDefinition definition) throws ClassNotFoundException {
        Class clazz = Class.forName(definition.getBeanClassName());
        RegisterChannel spec = (RegisterChannel) clazz.getAnnotation(RegisterChannel.class);

        log.info("register channel {}", definition.getBeanClassName());

        channelFactories.put(spec.protocol(), new SpringChannelFactory(applicationContext, definition));
    }

    public void removeChannel(Channel channel) {
        this.channels.remove(channel.getPrimaryAddress());
    }

    Channel make(Class<com.serious.service.Component> componentClass, String channelName, List<ServiceAddress> serviceAddresses) {
        ServiceAddress primaryServiceAddress = serviceAddresses.get(0);
        Channel channel = channels.get(primaryServiceAddress);
        if (channel == null) {
            log.info("create channel for {}", primaryServiceAddress.toString());

            ChannelFactory channelFactory = channelFactories.get(channelName);
            channel = channelFactory != null ? channelFactory.makeChannel(componentClass, serviceAddresses) : null;

            if (channel != null)
                channels.put(primaryServiceAddress, channel);
        }

        return channel;
    }

    // implement ApplicationContextAware

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
