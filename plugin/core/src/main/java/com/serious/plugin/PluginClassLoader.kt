package com.serious.plugin
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.IOException
import java.net.MalformedURLException
import java.net.URL
import java.util.*
import java.util.jar.JarFile
import kotlin.collections.ArrayList

private val logger: Logger = LoggerFactory.getLogger(PluginClassLoader::class.java)

class PluginClassLoader(private val storage: PluginStorage, parent: ClassLoader?) : ClassLoader(parent) {
    private var jars: MutableList<JarFile> = ArrayList()

    init {
        init()
    }

    fun init() {
        for ( jar in storage.listJars()) {
            logger.info("add jar {}", jar.name)

            jars.add(jar)
        }
    }

    @Throws(ClassNotFoundException::class)
    override fun findClass(name: String): Class<*> {
        val className = name.replace('.', '/') + ".class"
        val resourceUrl = getResourceUrl(className)

        return if (resourceUrl.size > 0) {
            val url = resourceUrl.iterator().next()
            val bytes = getBytes(url)
            val clazz = defineClass(name, bytes, 0, bytes.size)
            resolveClass(clazz)
            clazz
        }
        else {
            throw ClassNotFoundException()
        }
    }

    override fun findResource(name: String): URL? {
        val resourceUrls = getResourceUrl(name)
        return if (resourceUrls.isEmpty()) null else resourceUrls.iterator().next()
    }

    override fun findResources(name: String): Enumeration<URL> {
        val urls = getResourceUrl(name)

        return Collections.enumeration(urls)
    }

    // private

    private fun getBytes(classUrl: URL): ByteArray {
        return try {
            classUrl.openStream().readAllBytes()
        }
        catch (e: IOException) {
            throw RuntimeException()
        }
    }

    private fun getResourceUrl(className: String): List<URL> {
        val urls: MutableList<URL> = ArrayList()
        for (jar in jars) {
            val entry = jar.getEntry(className)
            if (entry != null) {
                urls.add(createUrl(entry.name, jar))
            }
        }
        return urls
    }

    private fun createUrl(className: String, jarFile: JarFile): URL {
        return try {
            URL("jar", null, "file:" + jarFile.name + "!/" + className)
        }
        catch (e: MalformedURLException) {
            throw RuntimeException()
        }
    }
}