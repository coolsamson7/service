package com.serious.service

import com.serious.injection.InjectorFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@Configuration
@ComponentScan
class ServiceConfiguration {
    @Bean
    fun injectorFactory(): InjectorFactory {
        return InjectorFactory()
    }
}
