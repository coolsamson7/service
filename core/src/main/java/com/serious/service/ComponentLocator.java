package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.util.Exceptions;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.env.Environment;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Set;


/**
 * The lifecycle is:
 * * <ul>
 * *     <li>ComponentLocator as a BeanFactoryPostProcessor scans for annotated component interfaces </li>
 * *     <li>generates the corresponding descriptors ( service and component )</li>
 * *     <li>generates new bean definitions that reference a dynamic proxy that is handled by the descriptor</li>
 * *     <li>if implementations are found, the beans are removed from the context, since they would lead to ambiguities and
 * *     remembered to be instantiated in a later phase setting the "local" attribute of the descriptor
 * *     </li>
 * * </ul>
 */
@Component
public class ComponentLocator implements BeanFactoryPostProcessor, EnvironmentAware {
    // static data

    static ArrayList<ComponentDescriptor<com.serious.service.Component>> components = new ArrayList<>();

    // local classes

    static class ComponentInterfaceProvider extends ClassPathScanningCandidateComponentProvider {

        public ComponentInterfaceProvider() {
            super(false);

            addIncludeFilter(new AnnotationTypeFilter(ComponentInterface.class, false));
        }

        @Override
        protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
            return beanDefinition.getMetadata().isInterface();
        }
    }

    // instance data

    private Environment environment;

    // private

    void scan() throws ClassNotFoundException {
        ClassPathScanningCandidateComponentProvider provider = new ComponentInterfaceProvider();

        Set<BeanDefinition> beans = provider.findCandidateComponents(environment.getProperty("service.package", "com"));

        for (BeanDefinition bean : beans)
            registerComponent(bean);
    }

    void registerComponent(BeanDefinition interfaceBean) throws ClassNotFoundException {
        components.add(new ComponentDescriptor(Class.forName(interfaceBean.getBeanClassName())));
    }

    // implement

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        try {
            this.scan();
        }
        catch (ClassNotFoundException e) {
            Exceptions.throwException(e);
        }

        DefaultListableBeanFactory registry = (DefaultListableBeanFactory) beanFactory;

        // create beans

        for (ComponentDescriptor<?> componentDescriptor : components)
            componentDescriptor.registerBeans(registry);
    }

    // implement EnvironmentAware

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }
}
