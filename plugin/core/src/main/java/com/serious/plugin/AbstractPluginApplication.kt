package com.serious.plugin
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
abstract class AbstractPluginApplication {
    // init

    init {
        instance = this
    }

    // abstract

    abstract fun restart()

    companion object {
        var instance: AbstractPluginApplication? = null

        fun restart() {
            instance!!.restart()
        }
    }
}