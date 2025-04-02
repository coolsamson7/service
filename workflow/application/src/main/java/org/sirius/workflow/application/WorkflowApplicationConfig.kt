package org.sirius.workflow.application
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */


import com.fasterxml.jackson.databind.ObjectMapper
import org.sirius.workflow.WorkflowConfiguration
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.messaging.converter.DefaultContentTypeResolver
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.converter.MessageConverter
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.util.MimeTypeUtils
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer


@Configuration
@Import(WorkflowConfiguration::class)
@EnableWebSocketMessageBroker
@ComponentScan
class WorkflowApplicationConfig : WebSocketMessageBrokerConfigurer {

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    // override

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/notifier")
        config.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry ) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*")
    }

    override fun configureMessageConverters(messageConverters: List<MessageConverter>) : Boolean {
        val resolver = DefaultContentTypeResolver()
        resolver.defaultMimeType = MimeTypeUtils.APPLICATION_JSON
        val converter = MappingJackson2MessageConverter()
        converter.setObjectMapper(objectMapper)
        converter.contentTypeResolver = resolver

        val mutableList : MutableList<MessageConverter> = messageConverters as MutableList<MessageConverter>
        mutableList.add(converter)

        return false
    }
}