package org.sirius.workflow;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;

class SpringTaskDelegate implements JavaDelegate {
    class ContextHolder {
        // instance data

        DelegateExecution execution;

        // constructor

        ContextHolder(DelegateExecution execution) {
            this.execution = execution;
        }
    }

    // static

    static ThreadLocal<ContextHolder> context = new ThreadLocal<ContextHolder>();

        // instance data

    private String name;
    private TaskRegistry registry;

    // constructor

    SpringTaskDelegate(String name,  TaskRegistry registry) {
        this.name = name;
        this.registry = registry;
    }

    // implement JavaDelegate

    public void execute(DelegateExecution execution) throws Exception {
        try {
            context.set(new ContextHolder(execution));

            this.registry.getServiceTask(name).execute(execution);
        }
        finally {
            context.remove();
        }
    }
}