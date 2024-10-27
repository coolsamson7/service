package com.serious.plugin.storage

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.plugin.AbstractPluginStorage
import com.serious.plugin.PluginMetadata
import com.serious.plugin.PluginStorage
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.nio.file.Files
import java.util.jar.JarFile
import kotlin.io.path.Path

private val logger: Logger = LoggerFactory.getLogger(PluginStorage::class.java)


class PluginFileStorage(val dir: File) : AbstractPluginStorage() {
    // instance data

    protected val plugins = ArrayList<PluginMetadata>()

    // init

    init {
        val mapper = ObjectMapper();
        for ( file in listFiles()) {
            val metaData = readMetadata(mapper, file)

            plugins.add(metaData)
        }

        if ( instance === null )
            instance = this
    }

    override fun listPlugins() : Array<PluginMetadata> {
        return plugins.toTypedArray()
    }

    override fun listJars() : Array<JarFile> {
        return plugins.map { plugin -> JarFile("${dir}/${plugin.file}") }.toTypedArray()
    }

    // implement PluginStorage

    override fun read(metaData : PluginMetadata) : ByteArray {
        logger.info("read plugin {}", metaData.name)

        return Files.readAllBytes(Path("${dir.absolutePath}/${metaData.file}"))
    }

    override fun store(metaData : PluginMetadata, content: ByteArray) {
        logger.info("store plugin {}", metaData.name)

        Files.write(Path("${dir.absolutePath}/${metaData.file}"), content)

        plugins.add(metaData)
    }

    override fun delete(metaData : PluginMetadata) {
        logger.info("delete plugin {}", metaData.name)

        Files.deleteIfExists(Path("$dir/${metaData.file}"))

        plugins.remove(metaData)
    }

    override fun listFiles() : Array<File> {
        return dir.listFiles { file -> file.name.endsWith(".jar") }
    }

    override fun readMetadata(mapper : ObjectMapper, file: File): PluginMetadata {
        val jar = JarFile(file)
        try {
            val manifest = jar.getJarEntry("manifest.json")

            val inputStream = jar.getInputStream(manifest)
            val root = mapper.readTree(inputStream)

            val name = root.get("name").asText()
            val version = root.get("version").asText()

            logger.info("read plugin {}", name)

            return PluginMetadata(name, version, file.name)
        }
        finally {
            jar.close()
        }
    }

    companion object {
        var instance : PluginStorage? = null
    }
}