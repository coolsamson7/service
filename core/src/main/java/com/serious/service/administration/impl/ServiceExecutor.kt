package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.service.*
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@Component
class ServiceExecutor {
    // instance data

    private val mapper = ObjectMapper()
    private val writer = mapper.writer().withDefaultPrettyPrinter()

    private val handlers: MutableMap<String, ChannelInvocationHandler> = ConcurrentHashMap()

    // private

    private fun convertObject(node: JsonNode, descriptor: InterfaceDescriptor?): Any? {
        return mapper.treeToValue(node, Class.forName(descriptor!!.name))
    }

    private fun convertValue(node: JsonNode, descriptor: ParameterDescriptor, model: ComponentModel): Any? {
        return when (descriptor.type.name) {
            "kotlin.String" ->
                node.asText()

            "kotlin.Short" ->
                node.asInt().toShort()

            "kotlin.Int" ->
                node.asInt()

            "kotlin.Long" ->
                node.asLong()

            "kotlin.Double" ->
                node.asDouble()

            "kotlin.Float" ->
                node.asDouble().toFloat()

            "kotlin.Boolean" ->
                node.asBoolean()

            "java.util.Date" ->
                Date.from(Instant.parse(node.asText()))

            else ->
                if (model.models.find { model -> model.name == descriptor.type.name } != null)
                    this.convertObject(node, model.models.find { model -> model.name == descriptor.type.name })
                else
                    null // TODO
        }
    }

    // public

    fun execute(component: String, request: String): String {
        // parse json

        val node = mapper.readTree(request)

        // header info

        val service = node.get("service").asText()
        val method = node.get("method").asText()

        // find meta data

        val componentDescriptor = ComponentDescriptor.forName(component)
        val serviceDescriptor   = componentDescriptor.findService(service)

        // fetch model

        val model = componentDescriptor.getModel()

        val serviceMetaData = model.services.find { s -> s.name == service }

        val methodDescriptor = serviceMetaData?.methods?.find { m -> m.name == method } // TODO: no overloading possible

        val methodParameters: List<ParameterDescriptor> = methodDescriptor!!.parameters

        // converts parameters

        val arguments = Array<Any?>(methodParameters.size) { null }

        val parameters = node.get("parameters")

        var index = 0
        for (parameter in parameters.elements()) {
            val name = parameter.get("name").asText()
            val value = this.convertValue(parameter.get("value"), methodParameters[index], model)

            arguments[index++] = value
        }

        // create proxy

        val serviceInterface: Class<out Service> = serviceDescriptor.serviceInterface
        val localService = ServiceManager.instance?.acquireLocalService(serviceInterface)
        val serviceMethod = serviceInterface.getDeclaredMethod(method, *methodParameters.map { param ->
            when (param.type.name) {
                "kotlin.Int" -> Int::class.java
                "kotlin.String" -> String::class.java
                "kotlin.Boolean" -> Boolean::class.java
                else -> Class.forName(param.type.name)
            }

        }.toTypedArray())

        // execute

        val result = serviceMethod.invoke(localService, *arguments)

        // and convert to json

        val json = writer.writeValueAsString(result)

        // yipee

        return json
    }
}