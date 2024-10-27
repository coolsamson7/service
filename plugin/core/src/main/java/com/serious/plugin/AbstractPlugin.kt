package com.serious.plugin

import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import org.slf4j.Logger
import org.slf4j.LoggerFactory

private val logger: Logger = LoggerFactory.getLogger(AbstractPlugin::class.java)

abstract class AbstractPlugin(registry: PluginRegistry) : Plugin {
    override lateinit var descriptor: PluginDescriptor

    init {
        registry.register(this)
    }

    // lifecycle

    @PostConstruct
    fun postConstruct() {
        this.startup()
    }

    @PreDestroy
    fun preDestroy() {
        this.shutdown()
    }

    // methods

    override fun startup() {
        logger.info("startup plugin {}", descriptor.name)
    }

    override fun shutdown() {
        logger.info("shutdown plugin {}", descriptor.name)
    }
}