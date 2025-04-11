
/* eslint-disable prefer-const */
//import { Modeling } from 'moddle';
//import { Element } from './../../../../node_modules/@types/moddle/index.d';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { Task } from "../service/task-service";
import { MessageBus, PortalComponentsModule, WithLifecycle } from '@modulefederation/portal';
import { TaskFormComponent } from '../task/task-form.component';
import { AbstractPaneComponent, LayoutModule } from '@modulefederation/components';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'task',
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss",
  standalone: true,
  imports: [
    // angular

    CommonModule,

    // material

    MatListModule,
    MatIconModule,

    // internal

    LayoutModule,

    TaskFormComponent,
    PortalComponentsModule
  ]
})
export class TaskComponent extends WithLifecycle {
  // input & output

  @Input() task!: Task

  // instance data

   @ViewChild('errorPane', { static: true }) private errorPane!: AbstractPaneComponent

   errors : string[] = []

  // constructor

  constructor(messageBus: MessageBus) {
    super()

    let subscription = messageBus.listenFor<any>("task-errors").subscribe(message => {
      switch ( message.message) {
        case "add-error":
          this.errors.push(message.arguments)
          if (this.errors.length == 1) {
            // open tab
            this.errorPane.selectTab(this.errorPane.tabs[0]) // there only is one pane ( TODO: id? )
          }
          break;

        case "clear-errors":
          this.errors.length = 0
          break;

        default:
          console.log("NYI")
      }
    })

    this.onDestroy(() => subscription.unsubscribe())
  }

  selectError(error: string) {
    // TODO
  }
}
