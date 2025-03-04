import { Injectable } from '@angular/core';
import { RegisterFunction, RegisterModule } from '@modulefederation/form/renderer';
import { TaskService } from '../service';

/**
 * the "system.io" module covers io related fucntions.
 */
@RegisterModule({name: 'workflow'})
@Injectable({providedIn: 'root'})
export class WorkflowFunctions {
    // constructor

    constructor(private taskService: TaskService) {
        console.log(this)
    }
    // the functions

  /**
   * print the argument to the console
   * @param arg
   */
  @RegisterFunction({
    description: 'finish the user task',
    parameters: [
      {
        name: 'id',
        description: 'the task id'
      }
    ]
  })
  finishTask(id: string): void {
    console.log(id);

    this.taskService.completeTask(id).subscribe()
  }
}
