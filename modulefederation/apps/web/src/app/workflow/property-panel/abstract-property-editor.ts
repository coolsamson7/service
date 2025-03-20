/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { PropertyEditor } from "./property-editor";
//import { PropertyEditorDirective } from "./property.editor.directive";

import  {Element, PropertyDescriptor  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { ValidationError } from "../validation";
import { SuggestionProvider } from "@modulefederation/portal";
import { ActionHistory } from "../bpmn"
import { PropertyGroupComponent } from "./property-group";

export interface EditorHints<T> {
  suggestionProvider?: SuggestionProvider
  oneOf?: T[]
}

export type Conversion = (i: any) => any

@Component({
  template: '<div></div>'
})
export abstract class AbstractPropertyEditor<T=any> implements PropertyEditor<T>, OnInit, OnChanges {
  // static stuff

  static conversions : {[key: string] : Conversion} = {}

  static registerConversion(source: string, target: string, conversion: Conversion) {
    AbstractPropertyEditor.conversions[source + ":" + target] = conversion
  }

  static getConversion(source: string, target: string) : Conversion {
    return AbstractPropertyEditor.conversions[source + ":" + target]
  }

  static {
    // target string

    AbstractPropertyEditor.registerConversion("boolean", "string", (value: any) => value.toString())
    AbstractPropertyEditor.registerConversion("number", "string", (value: any) => value.toString())
    AbstractPropertyEditor.registerConversion("string", "string", (value: any) => value)

    // target boolean

    AbstractPropertyEditor.registerConversion("boolean", "boolean", (value: any) => value)
    AbstractPropertyEditor.registerConversion("number", "boolean", (value: any) => value == 1)
    AbstractPropertyEditor.registerConversion("string", "boolean", (value: any) => value == "true")

    // target number

    AbstractPropertyEditor.registerConversion("boolean", "number", (value: any) => value == true ? 1 : 0 )
    AbstractPropertyEditor.registerConversion("number", "number", (value: any) => value)
    AbstractPropertyEditor.registerConversion("string", "number", (value: any) => parseInt(value))
  }

  // input

  @Input() shape!: Shape
  @Input() element!: Element
  @Input() readOnly = false // TODO -> hints
  @Input() property!: PropertyDescriptor
  @Input() hints : EditorHints<T> = {}
  @Input() group!: PropertyGroupComponent
  @Input() editor!: any // TODO
  @Input() v!: any//TODO

  // instance data

  action: any

  baseType = "string";
  in: Conversion | undefined = undefined;
  out: Conversion | undefined = undefined;

  // getter & setter

  get value() : any {
    let v = this.element.get(this.property.name)
    if (this.in )
      v = this.in(v)

    return v
  }

  set value(value: any) {
    if (this.out )
      value = this.out(value)

    this.element.set(this.property.name, value)
  }

  get actionHistory() : ActionHistory {
    return this.group.panel.actionHistory
  }



  // private

  canUndo() : boolean {
    return this.action !== undefined
  }

  checkState() {
    const oldAction =  this.action
    this.action = this.actionHistory.findAction(this.element, this.property.name)

    if ( oldAction !== this.action) {
      if ( oldAction )
        console.log("remove action for " + this.property.name)
      else
        console.log("add action for " + this.property.name)
    }
  }

 undo() : void {
    if ( this.action) {

      this.action = undefined
    }
  }

 isDirty() : boolean  {
    return this.canUndo()
  }

 onChange(event: any) {
  // possible coerce

    if ( this.out )
      event = this.out(event)

    const properties = () : any => {
      const result : any = {}

      result[this.property.name] = event

      return result
    }

    if (this.action) {
      this.editor.value = event

      // reuse existing action and simply update the new value

      this.action.context.properties[this.property.name] = event
    }
    else {
      this.action = this.actionHistory.updateProperties({
        element: this.shape,
        moddleElement: this.element,
        properties: properties()
      })

      console.log("new action for " + this.property.name)
    }

    // inform listeners

    this.editor.changedValue(event)
  }

  showError(error: ValidationError, select: boolean) {}

  // implement onInit

  ngOnInit() {
    // determine in/out coercions

    const value = this.value

    if ( typeof value !== this.baseType) {
      this.in = AbstractPropertyEditor.getConversion(typeof value, this.baseType)
      this.out = AbstractPropertyEditor.getConversion(this.baseType, typeof value)
    }

    // find action

    this.checkState()
  }

   // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    this.checkState()
  }
}
