package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.web.bind.annotation.GetMapping
import java.util.*
import kotlin.collections.HashMap

/**
 * A `ComponentDescriptor` covers the meta-data associated with a [Component]
 */
class ComponentDescriptor<T : Component>(componentInterface: Class<T>) : BaseDescriptor<T>(componentInterface) {
    // instance data

    @JvmField
    var health: String? = null
    @JvmField
    var serviceManager: ServiceManager? = null
    public var services: MutableList<ServiceDescriptor<*>> = LinkedList()

    // constructor
    init {
        analyze()

        descriptors.put(name, this)
    }

    // public

    override fun getComponentDescriptor(): ComponentDescriptor<T> {
        return this
    }

    override fun registerBeans(registry: DefaultListableBeanFactory) {
        super.registerBeans(registry)

        // fetch channels

        if (implementingBeans.get(this) != null) {
            val componentClass = Class.forName(implementingBeans.get(this)!!.beanClassName)
            val host = componentClass.getAnnotation(ComponentHost::class.java) as ComponentHost

            // health

            health = host.health

            // patch the request mapping for the getHealth()

            try {
                val getHealth = componentClass.getMethod("getHealth")
                if (getHealth.getAnnotation(GetMapping::class.java) != null) {
                    val getMapping = getHealth.getAnnotation(GetMapping::class.java)

                    //Annotations.changeAnnotationValue(getMapping, "value", new String[]{health});
                }
            }
            catch (e: NoSuchMethodException) {
                // ignore
            }
        }

        // services

        for (serviceDescriptor in services)
            serviceDescriptor.registerBeans(registry)
    }

    // private
    private fun analyze() {
        val annotation = serviceInterface.getAnnotation(ComponentInterface::class.java)

        if (!annotation.name.isBlank())
            name = annotation.name

        if (!annotation.description.isBlank())
            description = annotation.description

        // analyze services

        for (service in annotation.services)
            registerService(service.java)
    }

    private fun <T : Service> registerService(service: Class<T>) {
        services.add(ServiceDescriptor(this as ComponentDescriptor<Component>, service))
    }

    // public
    fun report(builder: StringBuilder) {
        builder
            .append("component ")
            .append(name).append("\n")

        if (hasImplementation()) {
            builder.append("\taddress:\n")

            if (externalAddresses != null)
                for (externalAddress in externalAddresses!!)
                    builder
                        .append("\t\t")
                        .append(externalAddress.toString())
                        .append("\n")
        }

        // services

        builder.append("\tservices:").append("\n")

        for (serviceDescriptor in services)
            serviceDescriptor.report(builder)
    }

    val externalAddresses: List<ChannelAddress>?
        get() = if (local != null) (local!! as Component).addresses else null

    companion object {
        @JvmField
        var descriptors: MutableMap<String, ComponentDescriptor<*>> = HashMap()
    }
}