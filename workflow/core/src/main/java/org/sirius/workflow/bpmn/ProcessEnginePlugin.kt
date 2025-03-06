
package org.sirius.workflow.bpmn

import org.camunda.bpm.engine.ProcessEngine
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl
import org.camunda.bpm.engine.impl.cfg.ProcessEnginePlugin
import org.camunda.bpm.model.bpmn.Bpmn
import org.springframework.stereotype.Component

@Component
//@Order(Ordering.DEFAULT_ORDER + 1)
class CustomElementsProcessEnginePlugin : ProcessEnginePlugin {
    override fun preInit(processEngineConfiguration: ProcessEngineConfigurationImpl) {
        // make sure the Bpmn transformer uses the extended Cmmn element palette

        Bpmn.INSTANCE = CustomBpmn()

        // register parse listener

       processEngineConfiguration.customPreBPMNParseListeners.add(SchemaParseListener())
    }

    override fun postInit(processEngineConfiguration: ProcessEngineConfigurationImpl) {
    }

    override fun postProcessEngineBuild(processEngine: ProcessEngine) {
    }
}