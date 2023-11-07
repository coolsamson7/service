package com.serious.demo

import com.ecwid.consul.v1.ConsulClient
import com.ecwid.consul.v1.QueryParams
import com.ecwid.consul.v1.catalog.CatalogServicesRequest
import com.ecwid.consul.v1.health.HealthChecksForServiceRequest
import com.serious.service.ServiceConfiguration
import com.serious.service.ServiceManager
import lombok.extern.slf4j.Slf4j
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.stereotype.Component
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer


// a configuration

@Configuration
@ComponentScan
@Import(ServiceConfiguration::class)
open class RootConfig

@Configuration
open class WebConfig {
    @Bean
    open fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**").allowedOrigins("http://localhost:4200")
            }
        }
    }
}

// main application

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
@Slf4j
@Component
open class ServiceApplication1 {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            SpringApplication.run(ServiceApplication1::class.java, *args)
        }
    }
}
