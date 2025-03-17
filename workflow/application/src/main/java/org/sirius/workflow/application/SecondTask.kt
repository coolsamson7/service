package org.sirius.workflow.application

import org.sirius.workflow.*

@ServiceTask(name="second", description = "bla")
class SecondTask : AbstractServiceTask() {
    // instance data

    @Input(description = "i1...") lateinit var i1: String
    @Input(description = "i2...") lateinit var i2: String

    @Output(description = "o1...") var o1: String = ""
    @Output(description = "o2...") var o2: String = ""

    // override

    override fun run() {
        println("## ${descriptor.name}(i1: ${i1}, i2: ${i2})")

        o1 = i1 + "x"
        o2 = i2 + "x"

        //setOutput("o1", getVariable<String>("i1") + "x")
        //setOutput("o2", getVariable<String>("i2") + "x")
    }
}