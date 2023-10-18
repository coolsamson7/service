package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.AllowedException
import com.serious.exception.FatalException
import com.serious.service.BaseDescriptor
import com.serious.service.ComponentManager
import com.serious.service.Service
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.lang.Nullable
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver
import java.lang.Exception
import java.lang.reflect.Method
import java.util.concurrent.ConcurrentHashMap


@Component
class RestResponseStatusExceptionResolver : ExceptionHandlerExceptionResolver() {
    // instance data

    @Autowired
    lateinit var componentManager : ComponentManager

    // constructor

    init {
        order = LOWEST_PRECEDENCE - 1
    }

    // private

    val method2Interface : MutableMap<Method, Class<out Service>> = ConcurrentHashMap()

    private fun serviceInterface(method: Method) : Class<out Service>? {
       // local function

        fun computeInterface() : Class<out Service> {
            var clazz = method.declaringClass
            var result: Class<out Service>? = null

            fun serviceInterface(interfaceClass: Class<*>?): Boolean {
                if (interfaceClass == null)
                    return false

                if (interfaceClass == Service::class.java)
                    return true

                for (superInterface in interfaceClass.interfaces)
                    if (result == null && serviceInterface(superInterface)) {
                        result = interfaceClass as Class<Service>?
                        return true
                    }

                if (result == null && serviceInterface(interfaceClass.superclass)) {
                    result = interfaceClass as Class<Service>?;
                    return true
                }

                return false
            }

            while (clazz != Object::class.java && result == null) {
                for (interfaceClass in clazz.interfaces)
                    serviceInterface(interfaceClass)

                // next

                clazz = clazz.superclass
            } // while

            return if ( result != null ) result!! else Service::class.java
        }

        val result = method2Interface.computeIfAbsent(method, {_ -> computeInterface()})
        return if ( result === Service::class.java)
            null
        else
            result
    }

    // override

    override fun shouldApplyTo(request: HttpServletRequest, @Nullable handler: Any?): Boolean {
        if ( handler is HandlerMethod && serviceInterface(handler.method) != null)
            return true//handler.method.exceptionTypes.isNotEmpty()

        return false
    }

    override fun doResolveHandlerMethodException(request: HttpServletRequest, response: HttpServletResponse, handlerMethod: HandlerMethod?, ex: java.lang.Exception): ModelAndView? {
        val method = handlerMethod!!.method

        val serviceInterface = serviceInterface(method)

        val interfaceMethod = serviceInterface!!.getMethod(method.name, *method.parameterTypes)

        // local function

        fun isDeclared() : Boolean {
            for (exception in interfaceMethod.exceptionTypes)
                if (exception.isAssignableFrom(ex.javaClass) )
                    return true

            return false
        }

        // we should find the component manager


        if ( isDeclared())
            return super.doResolveHandlerMethodException(request, response, handlerMethod, AllowedException(ex))

        else {
            val component = BaseDescriptor.forService(serviceInterface).getComponentDescriptor();

            val exception = component.componentManager!!.exceptionManager.handleException(ex) as Exception

            return super.doResolveHandlerMethodException(request, response, handlerMethod, FatalException(exception))
        }
    }
}