package com.serious.plugin
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.slf4j.Logger
import org.slf4j.LoggerFactory



private val logger: Logger = LoggerFactory.getLogger(PluginStorage::class.java)

abstract class AbstractPluginStorage : PluginStorage {
    // implement PluginStorage

    override fun synchronize(provider: PluginProvider) : Boolean {
        logger.info("synchronize plugins")

        var needsRestart = false

        val plugins = listPlugins()
        val toDelete = ArrayList<PluginMetadata>()
        toDelete.addAll(plugins)

        // synchronize

        for (plugin in provider.availablePlugins()) {
            val found = plugins.find { p -> p.name == plugin.name }
            if ( found !== null) {
                toDelete.remove(found)

                if ( found.version != plugin.version) {
                    logger.info("found ${plugin.name} in newer version ${plugin.version}")

                    logger.info("delete outdated ${found.name} in version ${found.version}")

                    delete(found)
                    store(plugin, provider.read(plugin))

                    needsRestart = true
                }
            }
            else {
                logger.info("fetch and store ${plugin.name} in version ${plugin.version}")

                needsRestart = true

                store(plugin, provider.read(plugin))
            }
        }

        // delete obsolete files

        for (plugin in toDelete) {
            logger.info("delete obsolete ${plugin.name} in version ${plugin.version}")

            delete(plugin)
        }

        return needsRestart
    }
}