package com.serious.spring
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/
import org.springframework.beans.BeansException
import org.springframework.beans.factory.BeanFactory
import org.springframework.beans.factory.BeanFactoryAware
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ConfigurableApplicationContext

 /**
 * A special [DefaultListableBeanFactory] that preserves all [BeanPostProcessor] of the parent factory
 */
class ChildBeanFactory(parentBeanFactory: ConfigurableApplicationContext) : DefaultListableBeanFactory(parentBeanFactory) {
    // local classes
    internal class ParentContextBeanPostProcessor(
        parent: ConfigurableApplicationContext,
        private val beanFactory: BeanFactory
    ) : BeanPostProcessor {
        // instance data
        private val parentProcessors: Collection<BeanPostProcessor>
        private val parentBeanFactory: BeanFactory
        // constructor
        /**
         * @param parent      the parent context
         * @param beanFactory the beanFactory associated with this post processor's context
         */
        init {
            parentProcessors = parent.getBeansOfType(BeanPostProcessor::class.java).values
            parentBeanFactory = parent.beanFactory
        }

        @Throws(BeansException::class)
        override fun postProcessBeforeInitialization(bean: Any, beanName: String): Any {
            var bean = bean
            for (processor in parentProcessors) {
                if (processor is BeanFactoryAware)
                        (processor as BeanFactoryAware).setBeanFactory(beanFactory)

                bean = try {
                    processor.postProcessBeforeInitialization(bean, beanName)
                } finally {
                    if (processor is BeanFactoryAware)
                        (processor as BeanFactoryAware).setBeanFactory(parentBeanFactory)
                }!!
            }
            return bean
        }

        @Throws(BeansException::class)
        override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
            var bean = bean
            for (processor in parentProcessors) {
                if (processor is BeanFactoryAware) (processor as BeanFactoryAware).setBeanFactory(beanFactory)
                bean = try {
                    processor.postProcessAfterInitialization(bean, beanName)
                } finally {
                    if (processor is BeanFactoryAware)
                        (processor as BeanFactoryAware).setBeanFactory(parentBeanFactory)
                }!!
            }
            return bean
        }
    }

    // constructor
    init {
        for (postProcessor in parentBeanFactory.getBeansOfType(BeanPostProcessor::class.java).values)
            addBeanPostProcessor(postProcessor)

        //addBeanPostProcessor(new ParentContextBeanPostProcessor(parentBeanFactory, this));
    }
}
