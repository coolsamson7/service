package org.sirius.workflow.application;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.camunda.bpm.spring.boot.starter.event.PostDeployEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Component;


@SpringBootApplication
@EnableProcessApplication
@EnableAspectJAutoProxy
@ComponentScan("org.sirius")

@EnableAsync
@Component
public class WorkflowApplication {

  @Autowired
  private RuntimeService runtimeService;

  public static void main(String... args) {
    SpringApplication.run(WorkflowApplication.class, args);
  }

  @EventListener
  private void processPostDeploy(PostDeployEvent event) {

    //runtimeService.startProcessInstanceByKey("process");
  }
}