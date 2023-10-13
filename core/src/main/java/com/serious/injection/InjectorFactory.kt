package com.serious.injection
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.lang.Keywords
import org.springframework.beans.BeansException
import org.springframework.beans.factory.FactoryBean
import org.springframework.beans.factory.config.BeanPostProcessor

 /**
 * @author Andreas Ernst
 */
class InjectorFactory(vararg injections: Injection<Annotation, Any>) : FactoryBean<Any?>, BeanPostProcessor {
    // constructor
    init {
        for (injection in injections)
            INSTANCE.registerInjection(injection)
    }

    // public
    fun registerInjection(injection: Injection<Annotation, Any>) {
        INSTANCE.registerInjection(injection)
    }

    // implement FactoryBean
    @Throws(Exception::class)
    override fun getObject(): Any? {
        return INSTANCE
    }

    override fun getObjectType(): Class<*> {
        return Injector::class.java
    }

    override fun isSingleton(): Boolean {
        return true
    }

    // implement BeanPostProcessor
    @Throws(BeansException::class)
    override fun postProcessBeforeInitialization(bean: Any, beanName: String): Any {
        INSTANCE.inject(bean, Keywords.NONE)
        return bean
    }

    @Throws(BeansException::class)
    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
        return bean
    }

    companion object {
        // static data
        private val INSTANCE = Injector()
    }
}
