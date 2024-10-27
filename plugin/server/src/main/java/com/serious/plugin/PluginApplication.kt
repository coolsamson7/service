package com.serious.plugin
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/


import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.plugin.provider.DirectoryPluginProvider
import com.serious.plugin.storage.PluginFileStorage
import lombok.extern.slf4j.Slf4j
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.EnableAspectJAutoProxy
import org.springframework.context.annotation.Import
import org.springframework.core.io.DefaultResourceLoader
import org.springframework.messaging.converter.DefaultContentTypeResolver
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.converter.MessageConverter
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.stereotype.Component
import org.springframework.util.MimeTypeUtils
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer
import java.io.File


@Configuration
@EnableWebSocketMessageBroker
@EnableAspectJAutoProxy
@Import(/*PluginsConfiguration::class, */PluginConfiguration::class)
class PluginConfig : WebSocketMessageBrokerConfigurer {

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    // override

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

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/notifier");
        config.setApplicationDestinationPrefixes("/app");
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry ) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
    }
}
// TEST

//@Component
class TestPluginProvider : DirectoryPluginProvider(File("/Users/andreasernst/projects/service/plugin/test/plugins")) {
}

// main application

private val logger: Logger = LoggerFactory.getLogger(AbstractPlugin::class.java)


@SpringBootApplication
@EnableAsync
@Slf4j
@Component
class PluginApplication : AbstractPluginApplication() {
    // instance data

    override fun restart() {
        val args = context.getBean(ApplicationArguments::class.java)
        val thread = Thread {
            context.close()
            context = SpringApplication.run(AbstractPluginApplication::class.java, *args.sourceArgs)
        }

        thread.setDaemon(false)
        thread.start()
    }

    companion object {
        private lateinit var context: ConfigurableApplicationContext

        @JvmStatic
        fun main(args: Array<String>) {
            // we need the store outside of spring since, the classloader will refer to it

            val storage = PluginFileStorage(File("/Users/andreasernst/projects/service/plugin/test/cache"))

            // create a custom class loader

            val classLoader = PluginClassLoader(storage, Thread.currentThread().getContextClassLoader())

            // create the main application

            val app = SpringApplication(PluginApplication::class.java)

            app.resourceLoader = DefaultResourceLoader(classLoader)

            context = app.run(*args)

            val registry = context.getBean(PluginRegistry::class.java)

            if ( registry.synchronize()) {
                logger.info("restart due to updated plugins")

                val thread = Thread {
                    context.close()
                    context = SpringApplication.run(PluginApplication::class.java, *args)
                }

                thread.setDaemon(false)
                thread.start()
            }
        }
    }
}
