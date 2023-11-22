package com.serious.service.administration.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.service.*
import com.serious.service.administration.ComponentIntrospectionService
import com.serious.service.administration.model.ChannelDTO
import com.serious.service.administration.model.ComponentDTO
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController


@Component
@RestController
class ComponentIntrospectionServiceImpl : ComponentIntrospectionService {
    // instance data

    //@Autowired
    //lateinit var serviceManager : ServiceManager

    // implement

    override fun fetchComponent(component: String) : ComponentDTO {
        val componentDescriptor = ComponentDescriptor.forName(component)!!

        return ComponentDTO(
            component,
            componentDescriptor.description,
            componentDescriptor.getModel(),
            componentDescriptor.externalAddresses!!.map { address ->  ChannelDTO(address.channel, listOf(address.uri)) })
    }

    override fun fetchComponentServices(component: String) : List<String> {
        val componentDescriptor = ComponentDescriptor.forName(component)!!

        return componentDescriptor.getModel().services.map { servce -> servce.name }
    }

    override fun listServices(component: String): Collection<InterfaceDescriptor> {
        val componentDescriptor = ComponentDescriptor.forName(component)

        return componentDescriptor!!.getModel().services
    }

    private fun convertObject(node : JsonNode, descriptor: InterfaceDescriptor?) : Any?{
        return ObjectMapper().treeToValue(node, Class.forName(descriptor!!.name))
    }
    private fun convertValue(node : JsonNode, descriptor: ParameterDescriptor, model: ComponentModel):Any? {
        return when (descriptor.type.name) {
            "kotlin.String" ->
                node.asText()
            "kotlin.Int" ->
                node.asInt()
            else ->
                if (model.models.find { model -> model.name == descriptor.type.name} != null)
                    this.convertObject(node, model.models.find { model -> model.name == descriptor.type.name})
                else
                    null
        }
    }
    override fun executeMethod(component: String, request: String) : String {
        val mapper = ObjectMapper()

        val node = mapper.readTree(request)

        val service = node.get("service").asText()
        val method = node.get("method").asText()

        // find meta data

        val componentDescriptor = ComponentDescriptor.forName(component)
        val serviceDescriptor = componentDescriptor?.services?.find { s -> s.name == service}
        val serviceInterface : Class<Service> = serviceDescriptor?.serviceInterface as Class<Service>

        // fetch model

        val model = componentDescriptor?.getModel()

        val serviceMetaData = model?.services?.find { s -> s.name.endsWith(service) }

        val methodDescriptor = serviceMetaData?.methods?.find { m -> m.name == method }

        val methodParameters : List<ParameterDescriptor> = methodDescriptor!!.parameters

        // converts parameters

        val arguments = Array<Any?>(methodParameters!!.size) { null }

        val parameters = node.get("parameters")

        var index = 0
        for ( parameter in parameters.elements()) {
            val name = parameter.get("name").asText()

            val value = this.convertValue(parameter.get("value"), methodParameters[index], model)

            arguments[index++] = value
            println(name + " = " + value)
        }



        val localService = ServiceManager.instance?.acquireLocalService(serviceInterface)
        val serviceMethod = serviceInterface.getDeclaredMethod(method, *methodParameters.map { param ->
            when ( param.type.name ) {
                "kotlin.Int" -> Int::class.java
                "kotlin.String" -> String::class.java
                else -> Class.forName(param.type.name)
            }

        }.toTypedArray() )

        val result = serviceMethod.invoke(localService, *arguments)

        val ow = ObjectMapper().writer().withDefaultPrettyPrinter()
        val json = ow.writeValueAsString(result)

        return json
    }
}