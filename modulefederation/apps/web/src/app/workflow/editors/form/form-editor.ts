import { CommonModule } from "@angular/common";
import { AbstractControl, FormsModule, NG_VALIDATORS, NgModel, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';
import { Component, Directive, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { ArraySuggestionProvider, FeatureRegistry, MessageBus } from "@modulefederation/portal";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { ValidationError } from "../../validation";
import { object, reference, TypeParser, ValidationModule } from "@modulefederation/common";
import { Schema, SchemaProperty } from "@modulefederation/form/renderer";
import { Element } from "moddle";



export function memberOfValidator(elements: string[]): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {
    const value = control.value;
    if (!value)
      return null;

    const result = elements.includes(value)

    return !result ? {model: "unknown form"}: null;
    }
}


@Directive({
  selector: "[member]",
  providers: [{
    useExisting: MemberDirective,
    provide: NG_VALIDATORS,
    multi: true
  }],
  standalone: true
})
export class MemberDirective implements Validator {
  @Input("member") elements! : string[]

  // implement Validator

  validate(control: AbstractControl): ValidationErrors | null {
    return memberOfValidator(this.elements)(control);
  }
}

 @RegisterPropertyEditor("camunda:formKey")
 @Component({
  selector: "form-editor",
  styleUrl: "./form-editor.scss",
  templateUrl: "./form-editor.html",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatMenuModule, MatIconModule, ValidationModule]
 })
 export class FormPropertyEditor extends AbstractPropertyEditor implements OnInit, OnChanges {
    // instance data
  
    @ViewChild("model") model! : NgModel;
    @ViewChild("input") input! : any;
  
  // instance data

  type = "feature"
  name = ""
  formNames: string[] = []
  featureSuggestionProvider : ArraySuggestionProvider
  formSuggestionProvider : ArraySuggestionProvider

  suggestionProvider! : ArraySuggestionProvider 
  icons : {[type: string] : string } = {
    form: "link",
    feature: "create"
  }

  // constructor

  constructor(featureRegistry : FeatureRegistry, private messageBus: MessageBus) {
    super()

    this.featureSuggestionProvider = new ArraySuggestionProvider(featureRegistry.finder().withTag("task").find().map(feature => feature.path!))

    this.formSuggestionProvider = new ArraySuggestionProvider(this.formNames)

    this.messageBus.broadcast({
      topic: "workflow",
      message: "set-forms",
      arguments: this.formNames
    })
  }

  // public

  changeType(type: string) {
    this.type = type

    if ( this.type == "feature")
      this.suggestionProvider == this.featureSuggestionProvider
    else {
      this.name = this.element["name"]
      this.suggestionProvider = this.formSuggestionProvider
    }

    super.onChange( this.type + ":" + this.name)
  }

  // TODO?

  getProcess() : Element {
    let el = this.element
    while ( el && el.$type !== "bpmn:Process")
      el = el.$parent

    return el as Element
  }

  /**
   * 
   */
  createSchemas() : Schema[] { 
    // TODO String vs string???

    const schemas : Schema[] = []

    let inputSchema : Schema | undefined = undefined
    let outputSchema : Schema | undefined = undefined
    let processSchema : Schema | undefined = undefined

    // input

    const inputOutput = (this.element['extensionElements']?.values || []).find((element : any) =>
      element.$type == "camunda:InputOutput"
    )

    if ( inputOutput ) {
      // input

      if (inputOutput["inputParameters"]) {
       inputSchema = {
          name: "input",
          properties: inputOutput["inputParameters"].map((input: any) => { 
            return {
              name: input.name,
              type:  input.type,
              constraint: input.constraint || ""
            }
          })
        } 

        schemas.push(inputSchema)
      }

      // output

      if (inputOutput["outputParameters"]) {
         outputSchema = {
          name: "output",
          properties: inputOutput["outputParameters"].map((output: any) => { 
            return {
              name: output.name,
              type:  output.type,
              constraint: output.constraint || ""
            }
          })
        } 

        schemas.push(outputSchema)
      } // if
    }

    // process TODO

    const process = this.getProcess()

    const schema = (process['extensionElements']?.values || []).find((element : any) => element.$type == "schema:schema")

    // TODO: könenn meherer sein, name classh.WTF

    if ( schema ) {
        processSchema = {
          name: "process",
          properties: schema.properties.map((prop: any) => {
            return {
              name: prop.name,
              type: prop.type,
              constraint: prop.constraint
            }
          })
        }

        schemas.push(processSchema)
    }

    // overall

    const overallSchema  : Schema = {
      name: "",
      properties: []
    }

    if ( inputSchema )
      overallSchema.properties.push({
        name: "input",
        type: "ref:input",
        constraint: "" // genau einer
    })

    if ( outputSchema )
      overallSchema.properties.push({
        name: "output",
        type: "ref:output",
        constraint: "" // genau einer
    })

    if  ( processSchema )
      overallSchema.properties.push({
        name: "process",
        type: "ref:process",
        constraint: "" // genau einer
    })

    schemas.push(overallSchema) // TODO wir brauchen ein konzept für ref:<schema> eingebettet!

    // TEST TODO

    this.createConstraints(schemas)

    return schemas
  }

   createConstraints(schemas: Schema[]) {
    const schemaMap : {[name: string]: any} = {}

    for ( const schema of schemas) {
      schemaMap[schema.name] = object(schema.properties.reduce((result: any, property: SchemaProperty) => {
        let type =  property.type

        if ( type.startsWith("ref:")) {
          type = type.substring("ref:".length)
          result[property.name] = reference(schemaMap[type])
        }
        else {
          type = type.toLowerCase() // TODO
          result[property.name] = TypeParser.parse(type, property.constraint)
        }

        return result
      }, {}))
  }

  // schema referce; refernce(schema)

     console.log(schemaMap)
   }



  addForm() {
    super.onChange( this.type + ":" + this.name)
    
    this.messageBus.broadcast({
      topic: "workflow",
      message: "add-form",
      arguments: {
        name: this.name,
        schemas: this.createSchemas()
      }
    })
  }

  editForm() {
    this.messageBus.broadcast({
      topic: "workflow",
      message: "edit-form",
      arguments: this.name
    })
  }

  parseForm() {
    let value = this.value
    if (!value)
      value = ""

    const colon = value.indexOf(":")

    if ( colon > 0) {
      if (value.startsWith("feature:"))
        this.type = "feature"
      else if (value.startsWith("form:"))
        this.type = "form"

      this.name = value.substring(colon + 1)
    }
    else {
      this.type = "feature"
      this.name = value
    }

    if ( this.type == "feature")
      this.suggestionProvider == this.featureSuggestionProvider
    else {
      this.name = this.element["name"]

      this.suggestionProvider = this.formSuggestionProvider
    }
  }

  // override

  override onChange(event: any) {
    this.name = event

    super.onChange( this.type + ":" + this.name)
  }

  // override AbstractPropertyEditor
  
  override showError(error: ValidationError, select: boolean) {
    super.showError(error, select)

    this.model.control.markAsTouched()
    if ( select ) {
        this.input.nativeElement.focus()
    }
  }
  
  // implement onInit

  override ngOnInit(): void {
    super.ngOnInit()

    this.parseForm()
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes)
    
    this.parseForm()
  }
 }
