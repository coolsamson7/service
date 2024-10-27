package com.serious.plugin

interface Plugin {
    var descriptor: PluginDescriptor

    fun startup()

    fun shutdown()
}

