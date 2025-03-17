package org.sirius.workflow

import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.config.BeanFactoryPostProcessor
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.beans.factory.support.GenericBeanDefinition
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.annotation.AnnotationAttributes
import org.springframework.core.type.filter.AnnotationTypeFilter
import org.springframework.stereotype.Component
import java.lang.reflect.Field
import javax.inject.Inject
import kotlin.reflect.KClass

@Component
class TaskRegistry : ApplicationContextAware, BeanFactoryPostProcessor {
    // local classes

    internal class ServiceTaskProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(ServiceTask::class.java, false))
        }
    }

    class BeanFactory(applicationContext : ApplicationContext) : DefaultListableBeanFactory(applicationContext) {
        // public

        fun <T>make(beanDefinition: BeanDefinition, clazz: Class<*>): T {
            val name = beanDefinition.beanClassName!!

            registerBeanDefinition(name, beanDefinition)

            return getBean(name, clazz) as T
        }
    }

    lateinit var beanFactory : BeanFactory

    val rootPackage = "org.sirius.workflow" // TODO

    val serviceTasks = LinkedHashMap<String, ServiceTaskDescriptor<AbstractServiceTask>>()

    fun createParameter(field: Field, attributes: AnnotationAttributes) : ParameterDescriptor{
        return ParameterDescriptor(
            field,
            attributes["name"] as String,
            attributes["type"] as Class<*>,
            attributes["description"] as String

        )
    }

    fun scanServiceTasks() {
        // handler

        for (bean in ServiceTaskProvider().findCandidateComponents(rootPackage)) {
            val annotations = (bean as AnnotatedBeanDefinition)
                .metadata
                .getAnnotationAttributes(ServiceTask::class.java.getCanonicalName())!!

            val clazz : Class<AbstractServiceTask> = Class.forName(bean.beanClassName) as Class<AbstractServiceTask>
            var name = annotations["name"] as String
            val description = annotations["description"] as String
            if (name.isBlank())
                name = bean.beanClassName!!

            val inputs = ArrayList<ParameterDescriptor>()
            val outputs = ArrayList<ParameterDescriptor>()

            for ( field in clazz.declaredFields) {
                field.isAccessible = true

                // input?

                val inputAnnotations = field.getAnnotationsByType(Input::class.java)
                if (inputAnnotations.isNotEmpty()) {
                    val inputAnnotation = inputAnnotations[0]


                    val name = inputAnnotation.name.ifBlank { field.name }

                    println("### add " + name + " : " + field.type.name)

                    inputs.add(ParameterDescriptor(
                        field,
                        name,
                        field.type,
                        inputAnnotation.description
                    ))
                } // if

                // output

                val outputAnnotations = field.getAnnotationsByType(Output::class.java)
                if (outputAnnotations.isNotEmpty()) {
                    val outputAnnotation = outputAnnotations[0]
                    outputs.add(ParameterDescriptor(
                        field,
                        outputAnnotation.name.ifBlank { field.name },
                        field.type,
                        outputAnnotation.description
                    ))
                }
            }

            // create

            bean.scope = ConfigurableBeanFactory.SCOPE_PROTOTYPE

            val descriptor = ServiceTaskDescriptor(name, description, clazz, bean, inputs.toTypedArray(), outputs.toTypedArray())

            serviceTasks[name] = descriptor

            println("found task ${descriptor.javaClass.name}")
        }
    }

    fun getDescriptor(name: String) : ServiceTaskDescriptor<AbstractServiceTask> {
        return serviceTasks.get(name)!!
    }

    fun getServiceTaskDescriptors() : Collection<ServiceTaskDescriptor<AbstractServiceTask>> {
        return serviceTasks.values
    }

    fun getServiceTask(name: String) : AbstractServiceTask {
        val descriptor = getDescriptor(name)

        val result : AbstractServiceTask = beanFactory.make(descriptor.bean, descriptor.clazz)

        // initialize

        descriptor.initialize(result)

        // done

        return result
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.beanFactory = BeanFactory(applicationContext)
    }

    override fun postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory) {
        scanServiceTasks()

        for ( descriptor in serviceTasks.values) {
            val beanDefinition = GenericBeanDefinition()

            beanDefinition.setBeanClass(SpringTaskDelegate::class.java)

            beanDefinition.constructorArgumentValues.addIndexedArgumentValue(0, descriptor.name)
            beanDefinition.constructorArgumentValues.addIndexedArgumentValue(1, this)

            println("##### register bean " + descriptor.name)

            (beanFactory as DefaultListableBeanFactory).registerBeanDefinition(descriptor.name, beanDefinition)
        }
    }
}