package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.ExceptionManager
import com.serious.injection.InjectorFactory
import org.springframework.boot.web.servlet.context.ServletWebServerInitializedEvent
import org.springframework.context.ApplicationListener
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration


/**
 * @author Andreas Ernst
 */
@Configuration
@ComponentScan
open class ServiceConfiguration {
    @Bean
    open fun injectorFactory(): InjectorFactory {
        return InjectorFactory()
    }

     @Bean
     open fun exceptionManager(): ExceptionManager {
         return ExceptionManager()
     }

    @Bean
    public open fun serverPortListenerBean(): ApplicationListener<ServletWebServerInitializedEvent> {
        return ApplicationListener { event: ServletWebServerInitializedEvent ->
            ServiceManager.instance?.startup( event.webServer.port)
        }
    }
}
