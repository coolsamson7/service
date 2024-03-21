package com.serious.portal.mapper

open class Transformer<CONTEXT>(val operations: Array<Operation<CONTEXT>>) {
    // local classes & interfaces

    interface Property<CONTEXT> {
        fun get(instance: Any, context: CONTEXT): Any?

        fun set(instance: Any, value: Any?, context: CONTEXT)
    }

    class Operation<CONTEXT>(val source: Property<CONTEXT>, val target: Property<CONTEXT>) {
        fun setTarget(from: Any, to: Any, context: CONTEXT) {
            target.set(to, source.get(from, context), context)
        }

        fun setSource(to: Any, from: Any, context: CONTEXT) {
            source.set(from, target.get(to, context), context)
        }
    }

    // public

    fun transformTarget(source: Any, target: Any, context: CONTEXT) {
        for (operation in operations)
            operation.setTarget(source, target, context)
    }
}
