import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core"

import { FormInventoryService, Task, TaskService, Variables } from "../service"
import { FormConfig, FormRendererComponent, FormRendererModule, Schema, SchemaProperty } from "@modulefederation/form/renderer";
import { CommonModule } from "@angular/common";
import { WorkflowFunctions } from "../functions/workflow-functions";
import { equals, object, ObjectConstraint, Type, TypeParser, ValidationError, ValidationMessageManager, ViolationContext } from "@modulefederation/common";
import { MessageBus } from "@modulefederation/portal";

const a = WorkflowFunctions

@Component( {
  selector: 'task-form',
  templateUrl: "./task-form.component.html",
  styleUrl: "./task-form.component.scss",
  standalone: true,
  imports: [CommonModule, FormRendererModule]
})
export class TaskFormComponent implements OnInit, OnChanges {
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

  context: any = {
    task: undefined,
    process: {},
    input: {},
    output: {},
  }

  savedProcessVariables : any = {}

  schema!: ObjectConstraint

  // constructor

  constructor(private formService: FormInventoryService, private taskService: TaskService, private messageBus: MessageBus, private validationMessageManager: ValidationMessageManager) {
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

  // private

  private processVariables() : string[] {
    const processSchema = this.form.schema?.find(schema => schema.name == "process")
    if ( processSchema )
      return  processSchema!.properties.map(property => property.name)
    else
      return []
  } 

  private createSchema(schemas: Schema[]): ObjectConstraint {
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

  private fillModel(model: any, variables : Variables) : any {
    // input

    for ( const prop of variables.input.properties)
      model.input[prop.name] = prop.value

    // output

    for ( const prop of variables.output.properties)
      model.output[prop.name] = prop.value

    // process

    for ( const prop of variables.process.properties)
     model.process[prop.name] = prop.value

    // TODO

    this.context.input = model.input
    this.context.output = model.output
    this.context.process = model.process

    // clone

    this.savedProcessVariables = {... model.process }
  }

  /*const label = this.labelFor(control, host);

  console.log(violation)

  return this.manager.provide({
    violations: violation.violations,
    //type: violation.violations[0].type,
    violation: violation.violations[0],
    label: label
  })*/

  validate() : boolean {
    // clear errors

    this.messageBus.broadcast({
      topic: "task-errors",
      message: "clear-errors"
    })

    if ( this.renderer.validate()) {
      // validate  output

      try {
        if ( this.schema?.shape["output"])
          (this.schema.shape["output"] as Type<any>)!.validate(this.model.output)
      }
      catch(error: unknown) {
        if (error instanceof ValidationError) {
          for ( const violation of error.violations) {
            const context : ViolationContext = {
              violations: error.violations,
              violation: violation,
              label: "LABEL" // TODO
             }

            this.messageBus.broadcast({
              topic: "task-errors",
              message: "add-error",
              arguments:  this.validationMessageManager.provide(context)
            })
          } // for
        }
        return false
      }

      return true
    }
    else {
      this.messageBus.broadcast({
        topic: "task-errors",
        message: "add-error",
        arguments: "check form errors"
      })

      return false
    }
  }

  setupForm(xml: string) {
      this.form = JSON.parse(xml)
      this.schema = this.createSchema(this.form.schema || [])
  }

  completeTask() {
    if ( this.validate()) {
      // collect process delta

      const delta : any = {}

      for ( const prop in this.savedProcessVariables) {
        if (!equals(this.savedProcessVariables[prop], this.model.process[prop]))
          delta[prop] = this.model.process[prop]
      }

      // call service

      // TODO: delta

      this.taskService.completeTask(this.task.processDefinitionId, this.task.processId, this.task.id, this.task.name, this.model.output).subscribe(result => 
        this.messageBus.broadcast({
          topic: "task",
          message: "completed",
          arguments: this.task
        })
      )
    }
  }

  // implement OnInit

  ngOnInit(): void {
    // expose task as a property

    this.context.task = this.task // TODO

    this.model.task = this.task
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    const result = this.parse(this.task)

    this.formService.find4Process(result.id, result.form).subscribe(form => {
        this.setupForm(form.xml)

        this.taskService.taskVariables(this.task, this.processVariables()).subscribe(variables => {
            // put input, output, process into model
            // would be cool if that were top-level properties

            this.fillModel(this.model, variables)

            // link everything to the task as well

            this.task.finish = () => this.completeTask()
            this.task.validate = () : boolean => this.validate()
        })
    })
  }
}
