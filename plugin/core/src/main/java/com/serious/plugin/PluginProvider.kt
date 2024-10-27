package com.serious.plugin

interface PluginProvider {
    fun read(metaData : PluginMetadata) : ByteArray

    fun availablePlugins(): Array<PluginMetadata>
}