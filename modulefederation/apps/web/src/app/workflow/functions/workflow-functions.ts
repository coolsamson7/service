import { Injectable } from '@angular/core';
import { RegisterFunction, RegisterModule } from '@modulefederation/form/renderer';
import { Task, TaskService } from '../service';

/**
 * the "system.io" module covers io related fucntions.
 */
@RegisterModule({name: 'workflow'})
@Injectable({providedIn: 'root'})
export class WorkflowFunctions {
  // constructor

  constructor(private taskService: TaskService) {
  }

  // the functions

  @RegisterFunction({
    description: 'finish the user task',
    parameters: [
      {
        name: 'task',
        description: 'the task'
      }
    ]
  })
  finishTask(task: Task): void {
    this.taskService.completeTask(task.processDefinitionId, task.processId, task.id, task.name, task.output).subscribe()
  }

  @RegisterFunction({
    description: 'set an output variable',
    parameters: [
      {
        name: 'task',
        description: 'the task'
      },
      {
        name: 'property',
        description: 'the output property name'
      }
      ,
      {
        name: 'value',
        description: 'the value'
      }
    ]
  })
  setOutput(task: Task, property: string, value: any): void {
    task.output[property] = value
  }
}
