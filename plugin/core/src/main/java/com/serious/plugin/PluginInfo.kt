package com.serious.plugin

data class PluginMethodInfo(
    var name: String,
    var description: String
)

data class PluginInfo(
    var name: String,
    var version: String,
    var description: String,
    var methods: Array<PluginMethodInfo>
)