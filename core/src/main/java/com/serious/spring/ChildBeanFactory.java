package com.serious.spring;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Collection;

/**
 * @author Andreas Ernst
 */
public class ChildBeanFactory extends DefaultListableBeanFactory {
    // local classes

    static class ParentContextBeanPostProcessor implements BeanPostProcessor {
        // instance data
        private final Collection<BeanPostProcessor> parentProcessors;
        private final BeanFactory beanFactory;
        private final BeanFactory parentBeanFactory;

        // constructor

        /**
         * @param parent      the parent context
         * @param beanFactory the beanFactory associated with this post processor's context
         */
        public ParentContextBeanPostProcessor(ConfigurableApplicationContext parent, BeanFactory beanFactory) {
            this.parentProcessors = parent.getBeansOfType(BeanPostProcessor.class).values();
            this.beanFactory = beanFactory;
            this.parentBeanFactory = parent.getBeanFactory();
        }

        /**
         * {@inheritDoc}
         */
        @Override
        public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
            for (BeanPostProcessor processor : parentProcessors) {
                if (processor instanceof BeanFactoryAware)
                    ((BeanFactoryAware) processor).setBeanFactory(beanFactory);

                try {
                    bean = processor.postProcessBeforeInitialization(bean, beanName);
                }
                finally {
                    if (processor instanceof BeanFactoryAware)
                        ((BeanFactoryAware) processor).setBeanFactory(parentBeanFactory);
                }
            }

            return bean;
        }

        /**
         * {@inheritDoc}
         */
        @Override
        public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            for (BeanPostProcessor processor : parentProcessors) {
                if (processor instanceof BeanFactoryAware)
                    ((BeanFactoryAware) processor).setBeanFactory(beanFactory);

                try {
                    bean = processor.postProcessAfterInitialization(bean, beanName);
                }
                finally {
                    if (processor instanceof BeanFactoryAware)
                        ((BeanFactoryAware) processor).setBeanFactory(parentBeanFactory);
                }
            }

            return bean;
        }
    }

    // constructor

    public ChildBeanFactory(ConfigurableApplicationContext parentBeanFactory) {
        super(parentBeanFactory);


        for (BeanPostProcessor postProcessor : parentBeanFactory.getBeansOfType(BeanPostProcessor.class).values())
            addBeanPostProcessor(postProcessor);

        //addBeanPostProcessor(new ParentContextBeanPostProcessor(parentBeanFactory, this));
    }
}
