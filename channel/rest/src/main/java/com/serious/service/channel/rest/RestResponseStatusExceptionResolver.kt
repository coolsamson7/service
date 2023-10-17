package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.AllowedException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.lang.Nullable
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver
import java.lang.reflect.Method


@Component
class RestResponseStatusExceptionResolver : ExceptionHandlerExceptionResolver() {

    init {
        order = LOWEST_PRECEDENCE - 1
    }

    // private

    private fun wrapException(method: Method, ex: java.lang.Exception) : Boolean {
        fun declaredException() : Boolean {
            for (exception in method.exceptionTypes)
                if (exception.isAssignableFrom(ex.javaClass) )
                    return true

            return false
        }

        return declaredException()
    }

    // override

    override fun shouldApplyTo(request: HttpServletRequest, @Nullable handler: Any?): Boolean {
        if ( handler is HandlerMethod)
            return handler.method.exceptionTypes.isNotEmpty()

        return false
    }

    override fun doResolveHandlerMethodException(request: HttpServletRequest, response: HttpServletResponse, handlerMethod: HandlerMethod?, ex: java.lang.Exception): ModelAndView? {
        return super.doResolveHandlerMethodException(request, response, handlerMethod, if ( wrapException(handlerMethod!!.method, ex)) AllowedException(ex) else ex)
    }
}