package org.sirius.workflow.application

import org.camunda.bpm.engine.impl.cfg.TransactionState
import org.camunda.bpm.engine.impl.context.Context
import org.sirius.workflow.*


// TEST

@ServiceTask(
    name="dummy",
    description = "bla",
    input  = [
        Parameter("i1", String::class, "i1 description"),
        Parameter("i2", String::class, "i2 description")
    ],
    output = [
        Parameter("o1", String::class, "o1 description"),
        Parameter("o2", String::class, "o2 description")
    ]
)
class DummyTask : AbstractServiceTask() {
    // instance data

    @Input lateinit var i1: String
    @Input("i2") lateinit var i2: String

    @Output var o1: String = ""
    @Output var o2: String = ""

    // override

    override fun run() {
        println("## ${descriptor.name}(i1: ${i1}, i2: ${i2})")

        o1 = i1 + "x"
        o2 = i2 + "x"

        //setOutput("o1", i1 + "x")
        //setOutput("o2", getVariable<String>("i2") + "x")
    }
}