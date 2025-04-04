import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core"

import { FormInventoryService, Task, TaskService } from "../service"
import { FormConfig, FormRendererComponent, FormRendererModule } from "@modulefederation/form/renderer";
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
export class TaskFormComponent implements OnInit, OnChanges, AfterViewInit {
  // input

  @Input() task!: Task;

  // instance data

  @ViewChild(FormRendererComponent) renderer! : FormRendererComponent

  form!: FormConfig
  model: any = {
    process: {},
    input: {},
    output: {},
  }

  // constructor

  constructor(private formService: FormInventoryService, private taskService: TaskService) {
  }

  // callbacks

  onStatusChange(event: any) {
    console.log("status change", event)
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
    this.model.task = this.task
  }

   // implement AfterViewInit

   ngAfterViewInit(): void {
     this.model.validate = this.renderer.validate
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    const result = this.parse(this.task)

    this.formService.find4Process(result.id, result.form).subscribe(form => {
        this.taskService.taskVariables(this.task).subscribe(variables => {
            this.form = JSON.parse(form.xml)

            // input

            for ( const prop of variables.input.properties)
                this.model.input[prop.name] = prop.value

            // output

            for ( const prop of variables.output.properties)
              this.model.output[prop.name] = prop.value

            // process

            for ( const prop of variables.process.properties)
              this.model.process[prop.name] = prop.value

            // link everything to the task as well

            this.task.process = this.model.process
            this.task.input = this.model.input
            this.task.output = this.model.output
            this.task.validate = () : boolean => {
                if ( this.renderer.validate()) {
                  console.log(this.model)
                  // check output

                  for ( const o in this.model.output ) {
                      if ( this.model.output[o] == null ) {
                        console.log("output " + o + " is null")
                          return false
                      }
                  }

                  return true
                }
                else {
                  return false
                }
            }
        })
    })
  }
}
