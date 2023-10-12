package com.serious.service

import com.serious.util.Exceptions
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.config.BeanFactoryPostProcessor
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.EnvironmentAware
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.env.Environment
import org.springframework.core.type.filter.AnnotationTypeFilter

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * The lifecycle is:
 * *
 * *      * ComponentLocator as a BeanFactoryPostProcessor scans for annotated component interfaces
 * *      * generates the corresponding descriptors ( service and component )
 * *      * generates new bean definitions that reference a dynamic proxy that is handled by the descriptor
 * *      * if implementations are found, the beans are removed from the context, since they would lead to ambiguities and
 * *     remembered to be instantiated in a later phase setting the "local" attribute of the descriptor
 * *
 * *
 */
@org.springframework.stereotype.Component
class ComponentLocator : BeanFactoryPostProcessor, EnvironmentAware {
    // local classes
    internal class ComponentInterfaceProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(ComponentInterface::class.java, false))
        }

        override fun isCandidateComponent(beanDefinition: AnnotatedBeanDefinition): Boolean {
            return beanDefinition.metadata.isInterface
        }
    }

    // instance data

    private var environment: Environment? = null

    // private
    @Throws(ClassNotFoundException::class)
    fun scan() {
        val provider: ClassPathScanningCandidateComponentProvider = ComponentInterfaceProvider()
        val beans = provider.findCandidateComponents(environment!!.getProperty("service.package", "com"))
        for (bean in beans) registerComponent(bean)
    }

    @Throws(ClassNotFoundException::class)
    fun registerComponent(interfaceBean: BeanDefinition) {
        components.add(ComponentDescriptor(Class.forName(interfaceBean.beanClassName) as Class<Component>))
    }

    // implement
    @Throws(BeansException::class)
    override fun postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory) {
        try {
            this.scan()
        }
        catch (e: ClassNotFoundException) {
            Exceptions.throwException(e)
        }
        val registry = beanFactory as DefaultListableBeanFactory

        // create beans
        for (componentDescriptor in components)
            componentDescriptor.registerBeans(registry)
    }

    // implement EnvironmentAware
    override fun setEnvironment(environment: Environment) {
        this.environment = environment
    }

    companion object {
        // static data
        var components = ArrayList<ComponentDescriptor<Component>>()
    }
}
