package org.sirius.workflow.application

import org.sirius.workflow.*


@ServiceTask(name="dummy", description = "bla")
class DummyTask : AbstractServiceTask() {
    // instance data

    @Input(description = "i1...") lateinit var i1: String
    @Input(description = "i2...")  var i2 : Boolean = false //lateinit var i2: java.lang.Boolean
    @Input(description = "i3...") var i3: Int = 0 //java.lang.Integer

    @Output(description = "o1...") var o1: String = ""
    @Output(description = "o2...") var o2: Boolean = false//java.lang.Boolean
    @Output(description = "o3...") var o3: Int = 0//java.lang.Integer

    // override

    override fun run() {
        println("## ${descriptor.name}(i1: ${i1}, i2: ${i2})")

        o1 = i1 + "x"
        o2 = i2//java.lang.Boolean.valueOf(i2.booleanValue())
        o3 = i3// java.lang.Integer.valueOf(i3.toInt() + 1)
    }
}