package org.sirius.workflow

import org.camunda.bpm.engine.ManagementService
import org.camunda.bpm.engine.RepositoryService
import org.camunda.bpm.engine.RuntimeService
import org.camunda.bpm.engine.repository.ProcessDefinition
import org.camunda.bpm.engine.runtime.ProcessInstance
import org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests
import org.camunda.bpm.engine.test.assertions.bpmn.ProcessInstanceAssert
import org.camunda.bpm.model.bpmn.Bpmn
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.sirius.workflow.bpmn.CustomBpmn
import org.sirius.workflow.bpmn.SchemaElement
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import javax.inject.Inject

/* TEST

@ServiceTask(name="dummy",
    input  = [
        Parameter("i1"),
        Parameter("i2")
    ],
    output = [
        Parameter("o1"),
        Parameter("o2")
    ]
)
class DummyTask : AbstractServiceTask() {
    // protected

    // TODO: more

    // TODO: what about the variable resolution?

    fun getVariable(name: String) : Any {
        return execution().getVariable(name)
    }

    // override

    override fun run() {
        Context.getCommandContext().getTransactionContext().addTransactionListener(TransactionState.COMMITTING) {
            context -> println("commiting") 
        }
        
        setOutput("o1", "o1")
        setOutput("o2", "o2")


        println("##### " + descriptor.name)
    }
}

@ServiceTask(name="dummy1",
    input  = [
        Parameter("dummy.o1"),
        Parameter("dummy.o2")
    ],
    output = [
        Parameter("o1"),
        Parameter("o2")
    ]
)
class Dummy1Task : AbstractServiceTask() {
    // protected

    // TODO: more

    // TODO: what about the variable resolution?

    fun getVariable(name: String) : Any {
        return execution().getVariable(name)
    }

    // override

    override fun run() {
        Context.getCommandContext().getTransactionContext().addTransactionListener(TransactionState.COMMITTING) {
                context -> println("commiting")
        }

        val o1 = getOutput("validateTheRequest.o1")
        val o2 = getOutput("validateTheRequest.o2")


        println("##### " + descriptor.name)
    }
}
*/
// TEST

@SpringBootTest(classes = [WorkflowConfiguration::class])
class WorkflowTest {
    @Autowired
    private val runtimeService: RuntimeService? = null

    @Autowired
    private val repositoryService: RepositoryService? = null

    @Autowired
    private val managementService: ManagementService? = null

    @Autowired
    lateinit var registry: TaskRegistry

    var pi: ProcessInstance? = null


    @BeforeEach
    fun beforeEach() {
        CustomBpmn()


        val stream = this.javaClass.classLoader.getResourceAsStream("loanApproval.bpmn")
        val model = Bpmn.readModelFromStream(stream)

        val x = model.getModelElementsByType(SchemaElement::class.java)

        val processDefinitions: List<ProcessDefinition> = repositoryService!!.createProcessDefinitionQuery().list()
        //assertEquals(1, processDefinitions.size())
        val resourceName = processDefinitions.get(0).resourceName
        val name = processDefinitions.get(0).name
        val id = processDefinitions.get(0).id

        val pd : ProcessDefinition = repositoryService.getProcessDefinition(id)



        val resourceNames = repositoryService.getDeploymentResourceNames(pd.deploymentId)



        val instance : ProcessInstance

        val inputStream = repositoryService.getResourceAsStream(pd.deploymentId, resourceName)

        System.out.println("##### WRITE")
        var size = 0
        val buffer = ByteArray(1024)
        while ((inputStream.read(buffer).also { size = it }) != -1)
            System.out.write(buffer, 0, size)
        System.out.println("##### DONE")

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