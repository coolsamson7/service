package com.serious.plugin

class PluginDescriptor(val name: String, val version: String, val description: String, val instance: Plugin, val methods: Array<PluginMethodDescriptor>) {
     fun findMethod(name: String) : PluginMethodDescriptor {
        val method = methods.find { m -> m.name == name }!!

        return method
    }
}