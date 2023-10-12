package com.serious.service

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * A <code>ServiceDescriptor</code> is a [BaseDescriptor] that takes care of [Service]s
 */
class ServiceDescriptor<T : Service>(
    componentDescriptor: ComponentDescriptor<Component>,
    serviceInterface: Class<T>
) : BaseDescriptor<T>(serviceInterface) {
    // instance data

    @JvmField
    val componentDescriptor: ComponentDescriptor<out Component>

    // constructor
    init {
        val annotation = this.serviceInterface.getAnnotation(ServiceInterface::class.java)
        if (!annotation.name.isBlank()) name = annotation.name
        if (!annotation.description.isBlank()) description = annotation.description
        this.componentDescriptor = componentDescriptor
    }

    override val isService: Boolean
        // override
        get() = true

    override fun getComponentDescriptor(): ComponentDescriptor<out Component> {
        return componentDescriptor
    }

    // public
    fun report(builder: StringBuilder) {
        builder
            .append("\t\t")
            .append(name)
        if (local != null) builder.append("[local]")
        builder.append("\n")
    }
}