package com.serious.service.injections
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.injection.AbstractInjection
import com.serious.injection.Injection
import com.serious.injection.InjectorFactory
import com.serious.lang.Keywords
import com.serious.service.BaseDescriptor
import com.serious.service.ComponentManager
import com.serious.service.Service
import com.serious.service.annotations.InjectService
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Field

 /**
 * Special [Injection] that injects [Service]s into target objects based on a field
 * or method annotation of type [InjectService].
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class ServiceInjection @Autowired constructor(injectorFactory: InjectorFactory) :
    AbstractInjection<Service?, InjectService, Keywords?>(
        InjectService::class.java
    ), ApplicationContextAware {
    // instance data
    private var componentManager: ComponentManager? = null

    // public

    init {
        injectorFactory.registerInjection(this as Injection<Annotation, Any>)
    }

    // implement AbstractInjection

    override fun computeValue(
        targetObject: Any?,
        accessibleObjectType: Class<*>?,
        accessibleObject: AccessibleObject?,
        annotation: InjectService,
        context: Keywords?
    ): Service {
        val serviceInterface = (accessibleObject as Field?)!!.type as Class<out Service>

        return if (annotation.preferLocal && BaseDescriptor.forService(serviceInterface).local != null)
            componentManager!!.acquireLocalService(serviceInterface)
        else
            componentManager!!.acquireService(serviceInterface, *annotation.channels)
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        componentManager = applicationContext.getBean(ComponentManager::class.java)
    }
}
