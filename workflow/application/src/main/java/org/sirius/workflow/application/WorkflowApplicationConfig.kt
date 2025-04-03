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
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServletServerHttpRequest
import org.springframework.messaging.converter.DefaultContentTypeResolver
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.converter.MessageConverter
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.util.MimeTypeUtils
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer
import org.springframework.web.socket.server.support.DefaultHandshakeHandler
import java.security.Principal


data class SessionPrincipal(val sessionId: String) : Principal {
    // override

    override fun getName(): String? {
        return sessionId
    }
}

class SessionHandshakeHandler : DefaultHandshakeHandler() {
    @Override
    override fun  determineUser(request: ServerHttpRequest , wsHandler: WebSocketHandler , attributes: MutableMap<String, Any> ): Principal {
        // take session id

        var sessionId = ""

        if (request is ServletServerHttpRequest) {
            val servletRequest = request
            val session = servletRequest.getServletRequest().getSession()

            attributes["sessionId"] = session.getId()

            sessionId =  session.getId()
        }

        return SessionPrincipal(sessionId)
    }
}

@Configuration
@Import(WorkflowConfiguration::class)
@EnableWebSocketMessageBroker
@ComponentScan
class WorkflowApplicationConfig : WebSocketMessageBrokerConfigurer {
    // instance data

    @Autowired private lateinit var objectMapper: ObjectMapper

    // override

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/user/queue/", "/session")
        config.setApplicationDestinationPrefixes("/app")
        config.setUserDestinationPrefix("/user/");
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry ) {
        registry
            .addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .setHandshakeHandler(SessionHandshakeHandler())
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