package com.serious.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import com.serious.plugin.provider.DirectoryPluginProvider
import com.serious.plugin.storage.PluginFileStorage
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Pointcut
import org.slf4j.*
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.event.ContextRefreshedEvent
import org.springframework.context.event.EventListener
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import java.io.File


@Controller
@Aspect
class PluginRegistry : ApplicationContextAware {
    // logger

    private val logger: Logger = LoggerFactory.getLogger(PluginRegistry::class.java)

    // instance data

    @Autowired
    lateinit var mapper : ObjectMapper
    @Autowired
    lateinit var provider : PluginProvider//= DirectoryPluginProvider(File("/Users/andreasernst/projects/service/plugin/test/plugins"))
    val storage = PluginFileStorage.instance

    val plugins = HashMap<String, PluginDescriptor>()
    lateinit var context: ApplicationContext
    @Autowired
    private lateinit var simpMessagingTemplate: SimpMessagingTemplate

    @EventListener
    fun handleContextRefreshEvent(ctxStartEvt: ContextRefreshedEvent?) {
        for (plugin in plugins) {
            logger.info("registered plugin {}", plugin.key)
        }
    }

    fun synchronize(): Boolean {
        return storage!!.synchronize(provider)
    }

    // private

    private fun analyze(plugin: Plugin) : PluginDescriptor {
        val clazz = plugin.javaClass

        val annotation = clazz.getAnnotation(RegisterPlugin::class.java)

        val methods = ArrayList<PluginMethodDescriptor>()

        for ( method in clazz.declaredMethods) {
            for ( annotation in method.annotations) {
                if ( annotation is Public) {
                    val name = if ( annotation.name.isEmpty() ) method.name else annotation.name

                    val isVoid = method.returnType === Void.TYPE

                    methods.add(PluginMethodDescriptor(name, method, isVoid))

                    break;
                }
            }
        } // for

        return PluginDescriptor(annotation.name, annotation.version, annotation.description, plugin, methods.toTypedArray())
    }

    // main entry point

    @MessageMapping("/call")
    fun handle(request: PluginRequest) {
        val plugin = plugin(request.plugin)
        val method = plugin.findMethod(request.method)
        val argsNode = mapper.readTree(request.args)

        // deserialize args

        val args = arrayOfNulls<Any>(argsNode.size())
        for ( i in 0..argsNode.size()-1)
            args[i] = mapper.treeToValue(argsNode.get(i), method.method.parameterTypes[i])

        // invoke

        val result =  method.method.invoke(plugin.instance, *args)

        if (!method.isVoid)
            simpMessagingTemplate.convertAndSend("/notifier/result",
                PluginResponse(request.id, request.plugin, request.method, result)
            )
    }

    fun send(request: PluginRequest) : String {
        simpMessagingTemplate.convertAndSend("/notifier/call", request)

        return "bar"
    }

    // public

    fun register(plugin: Plugin) : PluginDescriptor {
        val descriptor = this.analyze(plugin)

        plugin.descriptor = descriptor

        this.plugins[descriptor.name] = descriptor

        return descriptor
    }

    fun plugin(plugin: String) : PluginDescriptor {
        val descriptor = plugins[plugin]
        if ( descriptor != null)
            return descriptor
        else
            throw Error("unknown plugin " + plugin)
    }

    // AOP stuff

    @Pointcut(value = "execution(@com.serious.plugin.Callback * * (..))")
    fun callbackMethods(){}

    @Around("callbackMethods()")
    @Throws(Throwable::class)
    fun invokeCallback(joinPoint: ProceedingJoinPoint) : Any? {
        val plugin = joinPoint.target as Plugin
        val pluginName = plugin.descriptor.name
        val method = joinPoint.signature.name
        val args = mapper.writeValueAsString( joinPoint.args)

        this.send(PluginRequest("", pluginName, method, args))

        return null //joinPoint.proceed()
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.context = applicationContext
    }
}