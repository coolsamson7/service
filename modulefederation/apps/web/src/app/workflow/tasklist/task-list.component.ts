
/* eslint-disable prefer-const */
//import { Modeling } from 'moddle';
//import { Element } from './../../../../node_modules/@types/moddle/index.d';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TaskService } from '../service';

import { Task } from "../service/task-service";
import { TasklistDelta, TasklistManager } from './tasklist-manager';
import { MessageBus, WithLifecycle } from '@modulefederation/portal';

export class SelectionEvent{
  // constructor
  
  constructor(private list: TasklistComponent, public selection: Task, private oldSelection: Task | undefined) {}

  // public

  veto() {
    this.list.selection = this.oldSelection
  }
}

@Component({
  selector: 'task-list',
  templateUrl: "./task-list.component.html",
  styleUrl: "./task-list.component.scss",
  standalone: true,
  imports: [
    CommonModule,

    MatListModule
  ]
})
export class TasklistComponent extends WithLifecycle {
  // input & output

  @Output() task = new EventEmitter<SelectionEvent>();

  // instance data

  tasks : Task[] = []
  selection: Task | undefined = undefined

  // constructor

  constructor(private tasklistManager: TasklistManager, private taskService: TaskService,  messageBus: MessageBus) {
    super()
    
    // call via websocket

    const subscription = messageBus.listenFor<TasklistDelta>("tasklist").subscribe(
      message => {
        if (message.message == "update") {
          this.updateList(message.arguments!)
        }
      })

   this.onDestroy(() => subscription.unsubscribe())
  }

  // callbacks

  select(task: Task) {
    this.task.emit(new SelectionEvent(this, task, this.selection))

    this.selection = task
  }

  updateList(delta: TasklistDelta) {
      // delete

      for ( let task of delta.deleted)
          this.tasks.splice(this.tasks.indexOf(task), 1)

      // add
      
      for ( let task of delta.added)
          this.tasks.push(task)
  }    

  //   override WithLifecycle

  override ngOnInit(): void {
    super.ngOnInit()

    this.tasklistManager.register("demo")?.then(result => { // TODO
        this.tasks = result
    })
  }

  //   override WithLifecycle

  override ngOnDestroy(): void {
    super.ngOnDestroy()
    
    // probaly somewhere else...

     this.tasklistManager.unregister("demo")?.then(result => {
        console.log(result)
    })
  }
}
