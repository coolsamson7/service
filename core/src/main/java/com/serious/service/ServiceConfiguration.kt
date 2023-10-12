package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.injection.InjectorFactory
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
}
