import { Component, Input, OnInit } from "@angular/core"

import { FormInventoryService, Task, TaskService } from "../service"
import { FormConfig, FormRendererModule } from "@modulefederation/form/renderer";
import { CommonModule } from "@angular/common";
import { WorkflowFunctions } from "../functions/workflow-functions";

const a = WorkflowFunctions



@Component( {
  selector: 'task-form',
  templateUrl: "./task-form.component.html",
  styleUrl: "./task-form.component.scss",
  standalone: true,
  imports: [CommonModule, FormRendererModule]
})
export class TaskFormComponent implements OnInit {
  // input

  @Input() task!: Task;

  form!: FormConfig
  model: any = {}

  // constructor

  constructor(private formService: FormInventoryService, private taskService: TaskService) {

  }

  // private

  // <process-id>:<revision>:<process-definition-id>

  parse(task: Task) : any {
    let colon = task.form.indexOf(":")
    const form = task.form.substring(colon + 1)

    colon = task.processId.indexOf(":")
    const nextColon = task.processId.indexOf(":", colon + 1)

    const revision = parseInt(task.processId.substring(colon + 1, nextColon))

   const id =  task.processId.substring(nextColon + 1)

    return {
        id: task.processId, // ?
        revision: revision,
        form: form
    }
  }

  // implement OnInit

  ngOnInit(): void {
    const result = this.parse(this.task)

    this.formService.find4Process(result.id, result.revision, result.form).subscribe(form => {
        this.taskService.taskVariables(this.task).subscribe(variables => {
            this.form = JSON.parse(form.xml)

            const model : any = {
                task: this.task,
                input: {},
                process: {}
            }

            // input

            for ( const prop of variables.input.properties)
                model.input[prop.name] = prop.value

            // process

            for ( const prop of variables.process.properties)
                model.process[prop.name] = prop.value


            // done

            this.model = model
        })

    })
  }
}
