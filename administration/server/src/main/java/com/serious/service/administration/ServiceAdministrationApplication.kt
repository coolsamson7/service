package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.portal.PortalConfiguration
import com.serious.service.ServiceConfiguration
import lombok.extern.slf4j.Slf4j
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
//import org.springframework.boot.autoconfigure.security.reactive.PathRequest
import org.springframework.boot.autoconfigure.security.servlet.PathRequest
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer
import org.springframework.security.web.SecurityFilterChain
import org.springframework.stereotype.Component
import org.springframework.stereotype.Controller
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.EnableWebMvc
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver
import java.io.IOException


@Controller
class IndexController {
    @get:RequestMapping(value = ["/", ""])
    val index: String
        get() = "index.html"
}

@Configuration
@EnableWebSecurity
open class JWTSecurityConfig {
    @Bean
    @Throws(Exception::class)
    open fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { csrf -> csrf.disable() }
            //.cors(Customizer.withDefaults())
            .cors { cors -> cors.disable() }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/**").permitAll()
                    .requestMatchers("/administration/**").hasAnyRole("service-admin-role")
                    .requestMatchers("/h2-console/**").permitAll()
                    .anyRequest()
                    .authenticated()
            }
            .oauth2ResourceServer { oauth2: OAuth2ResourceServerConfigurer<HttpSecurity?> -> oauth2.jwt() }
            .build()
    }
}

// root configuration

@Configuration
@ComponentScan
@EntityScan( basePackages = ["com.serious"] )
@EnableJpaRepositories(basePackages = ["com.serious"])
@EnableTransactionManagement
@Import(ServiceConfiguration::class, PortalConfiguration::class)
@EnableScheduling
open class RootConfig

@Configuration
@EnableWebMvc
open class WebConfig {
    @Bean
    open fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
                registry.addResourceHandler("/**")
                    .addResourceLocations("classpath:/static/")
                    .resourceChain(true)
                    .addResolver(object : PathResourceResolver() {
                        @Throws(IOException::class)
                        override fun getResource(resourcePath: String, location: Resource): Resource {
                            val requestedResource = location.createRelative(resourcePath)
                            return if (requestedResource.exists() && requestedResource.isReadable) requestedResource
                            else ClassPathResource(
                                "/static/index.html"
                            )
                        }
                    })
            }

            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**").allowedOrigins("http://localhost:4200", "http://localhost:4300")
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
open class AdministrationServerApplication {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            SpringApplication.run(AdministrationServerApplication::class.java, *args)
        }
    }
}
