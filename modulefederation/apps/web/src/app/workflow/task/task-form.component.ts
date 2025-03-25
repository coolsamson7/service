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

  parse(task: Task) : any {
    const colon = task.form.indexOf(":")
    const form = task.form.substring(colon + 1)

    return {
        id: task.processDefinitionId,
        form: form
    }
  }

  // implement OnInit

  ngOnInit(): void {
    const result = this.parse(this.task)

    this.formService.find4Process(result.id, result.form).subscribe(form => {
        this.taskService.taskVariables(this.task).subscribe(variables => {
            this.form = JSON.parse(form.xml)

            const model : any = {
                task: this.task,
                process: {},
                input: {},
                output: {},
               
            }

            // input

            for ( const prop of variables.input.properties)
                model.input[prop.name] = prop.value

            // output

            for ( const prop of variables.output.properties)
              model.output[prop.name] = prop.value

            // process

            for ( const prop of variables.process.properties)
                model.process[prop.name] = prop.value

            // link everything to the task as well

            this.task.process = model.process
            this.task.input = model.input
            this.task.output = model.output


            // done

            this.model = model
        })

    })
  }
}
