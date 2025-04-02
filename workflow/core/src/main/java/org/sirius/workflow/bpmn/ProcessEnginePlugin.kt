
package org.sirius.workflow.bpmn

import org.camunda.bpm.engine.ProcessEngine
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl
import org.camunda.bpm.engine.impl.cfg.ProcessEnginePlugin
import org.camunda.bpm.engine.impl.javax.el.CompositeELResolver
import org.camunda.bpm.engine.impl.javax.el.ELResolver
import org.camunda.bpm.engine.spring.SpringExpressionManager
import org.camunda.bpm.model.bpmn.Bpmn
import org.sirius.workflow.bpmn.resolver.OutputELResolver
import org.sirius.workflow.bpmn.resolver.OutputNodeELResolver
import org.springframework.stereotype.Component

@Component
//@Order(Ordering.DEFAULT_ORDER + 1)
class CustomElementsProcessEnginePlugin : ProcessEnginePlugin {
    // private

    private fun addELResolver(processEngineConfiguration: ProcessEngineConfigurationImpl) {
        val manager: SpringExpressionManager = processEngineConfiguration.expressionManager as SpringExpressionManager
        val clazz = manager::class.java
        val method = clazz.superclass.getDeclaredMethod("getCachedElResolver")

        method.isAccessible = true

        val resolver = method.invoke(manager) as CompositeELResolver

        val resolversField = resolver.javaClass.getDeclaredField("resolvers")
        resolversField.isAccessible = true

        val resolvers = resolversField.get(resolver) as ArrayList<ELResolver>

        // add 2 new...

        resolvers.add(0, OutputNodeELResolver())
        resolvers.add(0, OutputELResolver())
    }
    // override

    override fun preInit(processEngineConfiguration: ProcessEngineConfigurationImpl) {
        // add EL

        this.addELResolver(processEngineConfiguration)

        // replace

        Bpmn.INSTANCE = CustomBpmn()

        // register parse listener

       processEngineConfiguration.customPreBPMNParseListeners.add(SchemaParseListener())
       processEngineConfiguration.customPreBPMNParseListeners.add(UserTaskParseListener())
    }

    override fun postInit(processEngineConfiguration: ProcessEngineConfigurationImpl) {
    }

    override fun postProcessEngineBuild(processEngine: ProcessEngine) {
    }
}