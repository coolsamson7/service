package com.serious.plugin
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import java.util.jar.JarFile

interface PluginStorage {
    fun listFiles() : Array<File>

    fun  listJars() : Array<JarFile>

    fun listPlugins() : Array<PluginMetadata>

    fun readMetadata(mapper : ObjectMapper, file: File) : PluginMetadata

    fun read(metaData : PluginMetadata) : ByteArray

    fun store(metaData : PluginMetadata, content: ByteArray)

    fun delete(metaData : PluginMetadata)

    fun synchronize(provider: PluginProvider) : Boolean
}

