package org.sirius.common.beans
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.annotation.PostConstruct
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

typealias BeanHandler<T> = (T) -> Unit

@Component
class BeanObserver : ApplicationContextAware  {
    init {
        println("### create bean observer")
    }
    // local class

    private data class Request<T:Any>(val clazz: KClass<T>, val beanHandler: BeanHandler<T>)

    // instance data

    lateinit var ac: ApplicationContext

    @PostConstruct
    fun resolve() {
        println("### postr construct bean observer")
        for ( item in requests) {
            item.beanHandler(ac.getBean(item.clazz.java))
        }
    }

    // companion

    companion object {
        private val requests = ArrayList<Request<Any>>()

        fun <T:Any> require(clazz: KClass<T>, beanHandler: BeanHandler<T>) {
            requests.add(Request(clazz, beanHandler) as Request<Any>)
        }
    }

    // implement ApplicationContextAware

    override fun setApplicationContext(applicationContext: ApplicationContext) {
        println("### setApplicationContext bean observer")
        this.ac = applicationContext
    }
}