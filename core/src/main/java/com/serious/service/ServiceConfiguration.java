package com.serious.service;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.injection.InjectorFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * @author Andreas Ernst
 */
@Configuration
@ComponentScan
public class ServiceConfiguration {
    @Bean()
    public InjectorFactory injectorFactory() {
        InjectorFactory factory = new InjectorFactory();

        return factory;
    }
}
