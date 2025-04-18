package com.serious.service.administration
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.plugin.PluginMetadata
import com.serious.plugin.provider.DirectoryPluginProvider
import com.serious.portal.PortalConfiguration
import com.serious.service.ServiceConfiguration
import lombok.extern.slf4j.Slf4j
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.sirius.common.tracer.trace.ConsoleTrace
import org.sirius.events.EventConfiguration
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.*
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.http.MediaType
import org.springframework.messaging.converter.DefaultContentTypeResolver
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.converter.MessageConverter
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer
import org.springframework.security.web.SecurityFilterChain
import org.springframework.stereotype.Component
import org.springframework.stereotype.Controller
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.springframework.util.MimeTypeUtils
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.EnableWebMvc
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer
import java.io.File
import java.io.IOException


@Controller
class IndexController {
    @get:RequestMapping(value = ["/", ""])
    val index: String
        get() = "index.html"
}

@Configuration
@EnableWebSecurity
class JWTSecurityConfig {
    @Bean
    @Throws(Exception::class)
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { csrf -> csrf.disable() }
            //.cors(Customizer.withDefaults())
            .cors { cors -> cors.disable() }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/**").permitAll()
                    //TODO WTF.requestMatchers("/administration/**").hasAnyRole("service-admin-role")
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
@EnableAspectJAutoProxy
@Import(ServiceConfiguration::class, PortalConfiguration::class, EventConfiguration::class)
@EnableScheduling
class RootConfig

@Configuration
@EnableWebMvc
class WebConfig {
    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
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
                registry.addMapping("/**").allowedOrigins("http://localhost:4200", "http://localhost:4203",  "http://localhost:4300")
            }
        }
    }


}

@RestController
@RequestMapping("plugin/")
class PluginService {
    // instance data

   var provider = DirectoryPluginProvider(File("/Users/andreasernst/projects/service/plugin/test/plugins")) // TODO

    // rest calls

    @GetMapping("/list")
    @ResponseBody
    fun list(): Array<PluginMetadata> {
        return provider.availablePlugins()
    }

    @PostMapping("/read", produces = arrayOf(MediaType.APPLICATION_OCTET_STREAM_VALUE))
    @ResponseBody
    fun read(@RequestBody metaData: PluginMetadata): ByteArray {
        return provider.storage.read(metaData)
    }
}

// TODO TEST

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    @Autowired
    private lateinit var objectMapper: ObjectMapper
    //@Override
    override fun configureMessageConverters(messageConverters: List<MessageConverter>) : Boolean {
        val resolver = DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);
        val converter = MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        converter.setContentTypeResolver(resolver);

        val mutableList : MutableList<MessageConverter> = messageConverters as MutableList<MessageConverter>
        mutableList.add(converter);

        return false;
    }

    //@Override
    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/notifier");
        config.setApplicationDestinationPrefixes("/app");
    }

    //@Override
    override fun registerStompEndpoints(registry: StompEndpointRegistry ) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
    }
}

// main application

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
@Slf4j
@Component
class ServiceAdministrationApplication {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            System.setProperty("java.net.preferIPv4Stack" , "true");

            val tracer = Tracer(ConsoleTrace(), "%d{yyyy-MM-dd HH:mm:ss,SSS} %l{-6s} [%p{-10s}] %m")

            tracer
                .setTraceLevel("org.sirius", TraceLevel.FULL)
                .setTraceLevel("com.serious", TraceLevel.FULL)

            SpringApplication.run(ServiceAdministrationApplication::class.java, *args)
        }
    }
}
