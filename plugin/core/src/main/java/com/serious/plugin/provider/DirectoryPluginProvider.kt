package com.serious.plugin.provider

import com.serious.plugin.PluginMetadata
import com.serious.plugin.PluginProvider
import com.serious.plugin.storage.PluginFileStorage
import java.io.File

open class DirectoryPluginProvider(dir: File) : PluginProvider {
    // instance data

    val storage =  PluginFileStorage(dir)

    // implement PluginProvider

     override fun availablePlugins(): Array<PluginMetadata> {
        return storage.listPlugins()
    }

    override fun read(metaData: PluginMetadata): ByteArray {
        return storage.read(metaData)
    }
}