package org.sirius.workflow

import org.springframework.stereotype.Component

@Component("variables")
class VariableStore {
    val variables = HashMap<String,String>()

    fun rememberOutput(name: String, value: String) {
        variables[name] = value
    }

    fun getOutput(name: String) : String {
        return variables[name]!!
    }
}