import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core"

import { FormInventoryService, Task, TaskService } from "../service"
import { FormConfig, FormRendererComponent, FormRendererModule, Schema, SchemaProperty } from "@modulefederation/form/renderer";
import { CommonModule } from "@angular/common";
import { WorkflowFunctions } from "../functions/workflow-functions";
import { object, ObjectConstraint, Type, TypeParser, ValidationError } from "@modulefederation/common";

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

  schema!: ObjectConstraint

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

createSchema(schemas: Schema[]): ObjectConstraint {
    const schemaMap : {[name: string]: ObjectConstraint} = {}

    for ( const schema of schemas) {
      schemaMap[schema.name] = object(schema.properties.reduce((result: any, property: SchemaProperty) => {
        let type =  property.type

        if ( type.startsWith("ref:")) {
          type = type.substring("ref:".length)
          result[property.name] = schemaMap[type]// TODO ? reference(schemaMap[type])
        }
        else {
          type = type.toLowerCase() // TODO
          result[property.name] = TypeParser.parse(type, property.constraint)
        }

        return result
      }, {}))
    } // for

    return schemaMap[""]
  }

  // implement OnInit

  ngOnInit(): void {
    // expose task as a property

    this.model.task = this.task
  }

   // implement AfterViewInit

   ngAfterViewInit(): void {
     // expose validate as a property

     this.model.validate = this.renderer.validate
  }

  // TODO. check output variables against schema?

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    const result = this.parse(this.task)

    this.formService.find4Process(result.id, result.form).subscribe(form => {
        this.taskService.taskVariables(this.task).subscribe(variables => {
            this.form = JSON.parse(form.xml)

            this.schema = this.createSchema(this.form.schema || [])

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
            this.task.finish = () => {
                this.taskService.completeTask(this.task.processDefinitionId, this.task.processId, this.task.id, this.task.name, this.task.output).subscribe()
            }
            this.task.validate = () : boolean => {
                if ( this.renderer.validate()) {
                  console.log(this.model)

                  try {
                    (this.schema.shape["output"] as Type<any>)!.validate(this.model.output)
                  }
                  catch(error: unknown) {
                    console.log(error) // TODO
                    return false
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
