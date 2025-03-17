package org.sirius.workflow

import org.camunda.bpm.engine.RuntimeService
import org.camunda.bpm.engine.runtime.ProcessInstance
import org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests
import org.camunda.bpm.engine.test.assertions.bpmn.ProcessInstanceAssert
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.sirius.workflow.bpmn.CustomBpmn
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [WorkflowConfiguration::class])
class WorkflowTest {
    @Autowired
    private val runtimeService: RuntimeService? = null

    var pi: ProcessInstance? = null

    @BeforeEach
    fun beforeEach() {
        CustomBpmn()

        pi = runtimeService!!.startProcessInstanceByKey("loanApproval")
        BpmnAwareTests.assertThat(pi).hasPassed("StartEvent_1").hasNotPassed("Task_0dfv74n").isNotEnded()
    }

    @Test
    fun happyPath() {
        completeTask().hasPassed("Task_0dfv74n").isEnded()
    }

    private fun completeTask(): ProcessInstanceAssert {
        BpmnAwareTests.complete(BpmnAwareTests.task())
        return BpmnAwareTests.assertThat(pi)
    }
}