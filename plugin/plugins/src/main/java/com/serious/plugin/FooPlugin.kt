package com.serious.plugin

import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Component

@RegisterPlugin("foo")
@Component
class FooBarPlugin(val registry: PluginRegistry) : AbstractPlugin(registry), ApplicationContextAware {
    // instance data

    lateinit var context: ApplicationContext

    // methods

    @Public()
    fun nix() {

    }

    @Public("foo")
    fun foo(msg: String, times: Int) : String {
        println(msg)

        val p = this.context.getBean(FooBarPlugin::class.java)
        for ( i in 0..times)
            p.bar(msg)

        return "ok"
    }

    @Callback
    fun bar(msg: String) {
    }

    // implement ApplicationContextAware

    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.context = applicationContext
    }
}
