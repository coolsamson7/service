/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input, OnInit } from "@angular/core"
import { PropertyEditor } from "./property-editor"
import { Context, PropertyEditorDirective } from "./property.editor.directive"
import  {Element, PropertyDescriptor, Moddle } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { ValidationError } from "../validation";
import { PropertyGroupComponent } from "./property-group";
import { ActionHistory } from "../bpmn";
import { constant } from "lodash";

@Component({
  template: '<div></div>'
})
export abstract class AbstractExtensionEditor implements PropertyEditor, OnInit { 
  // input

  @Input() context!: Context
  @Input() element!: Element
  @Input() property!: PropertyDescriptor // TODO unused
  @Input() editor!: PropertyEditorDirective

  model!: Moddle

  get actionHistory() : ActionHistory {
    return this.context.group.panel.actionHistory
  }

  // public

  prop(name: string) : PropertyDescriptor {
    return this.element.$descriptor.properties.find(prop => prop.name == name)!
  }

  get<T>(property: string) : T {
    return this.element[property] as T
  }

  set<T>(property: string, value: T) : void {
     this.element[property] = value
  }

  inputs(property: string, ...properties: string[]) : any {
    const result : any = { 
      value: this.get(property) 
    }

    for ( const prop of properties)
      result[prop] = this.get(prop)
   
    return result
  }

 create(type: string, properties: any) {
    const element = this.element['$model'].create(type)

    for ( const propertyName in properties)
       element[propertyName] = properties[propertyName]

    element.$parent = this.element

    return element
  }
  

  // abstract

  checkState() {}

  isDirty() : boolean  {
    return false
  }

  undo() : void {}

  showError(error: ValidationError) {}
   
  // callback

  onChange(event: any) {

  }

  // implement OnInit

  ngOnInit(): void {
    this.model = this.element["$model"]
  }
}
