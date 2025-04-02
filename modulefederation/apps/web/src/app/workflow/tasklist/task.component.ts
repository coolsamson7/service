
/* eslint-disable prefer-const */
//import { Modeling } from 'moddle';
//import { Element } from './../../../../node_modules/@types/moddle/index.d';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  Input
} from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { Task } from "../service/task-service";
import { FeatureOutletDirective, PortalComponentsModule, WithLifecycle } from '@modulefederation/portal';
import { TaskFormComponent } from '../task/task-form.component';


@Component({
  selector: 'task',
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss", 
  standalone: true,
  imports: [
    // angular

    CommonModule,

    // internal

    TaskFormComponent,
    PortalComponentsModule
  ]
})
export class TaskComponent extends WithLifecycle {
  // input & output

  @Input() task!: Task

  // instance data

  // constructor

  constructor() {
    super()
  }
}
