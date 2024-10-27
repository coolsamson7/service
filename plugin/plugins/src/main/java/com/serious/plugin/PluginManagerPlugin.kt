package com.serious.plugin

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.springframework.stereotype.Component


@RegisterPlugin("plugin-manager", "1.0", "...")
@Component
class PluginsManagerPlugin(val registry: PluginRegistry) : AbstractPlugin(registry) {
    // methods

    @Public()
    fun restart()  {
        AbstractPluginApplication.restart()
    }

    @Public()
    fun plugins() : Array<PluginInfo> {
        return registry.plugins.values.map { plugin ->
            PluginInfo(
                plugin.name,
                plugin.version,
                plugin.description,
                plugin.methods.map { method -> PluginMethodInfo(method.name, "des") }.toTypedArray()
            ) }.toTypedArray()
    }
}
