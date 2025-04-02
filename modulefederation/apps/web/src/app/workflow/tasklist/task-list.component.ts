
/* eslint-disable prefer-const */
//import { Modeling } from 'moddle';
//import { Element } from './../../../../node_modules/@types/moddle/index.d';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TaskService } from '../service';

import { Task } from "../service/task-service";
import { TasklistDelta, TasklistManager } from './tasklist-manager';


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
export class TasklistComponent implements OnInit, OnDestroy {
  // input & output

  //@Input() process?: string;

  // instance data

  tasks : Task[] = []
  selectedTask?: Task

  // constructor

  constructor(private tasklistManager: TasklistManager, private taskService: TaskService) {
    // call via websocket

   
  }

  // callbacks

  reload() {
    this.tasklistManager.register(this)?.then(result => {
        this.tasks = result
    })
  }

  claimTask(task: Task) {
      this.taskService.getTasks({
        //unassigned: true, // ??
        assignee: "demo"
      }).subscribe()



    this.selectedTask = task
   }

    updateList(delta: TasklistDelta) {
        // delete

       for ( let task of delta.deleted)
            this.tasks.splice(this.tasks.indexOf(task), 1)

        // add
        
        for ( let task of delta.added)
            this.tasks.push(task)
    }    

  // implement OnInit

  ngOnInit(): void {
    this.tasklistManager.register(this)?.then(result => {
        this.tasks = result
    })
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    // probaly somewhere else...

     this.tasklistManager.unregister()?.then(result => {
        console.log(result)
    })
  }
}
