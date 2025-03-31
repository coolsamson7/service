/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { PropertyEditor } from "./property-editor";
import { EventBus } from "bpmn-js/lib/BaseViewer";

import  {Element, PropertyDescriptor  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { ValidationError } from "../validation";
import { SuggestionProvider } from "@modulefederation/portal";
import { ActionHistory } from "../bpmn"
import { PropertyGroupComponent } from "./property-group";
import { PropertyEditorDirective } from "./property.editor.directive";

export type Conversion = (i: any) => any

export interface EditorSettings<T> {
  suggestionProvider?: SuggestionProvider
  readOnly?: boolean
  in?: Conversion,
  out?: Conversion,
  oneOf?: T[]
}


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
  @Input() property!: PropertyDescriptor
  @Input() settings : EditorSettings<T> = {
  }
  @Input() group!: PropertyGroupComponent
  @Input() editor!: PropertyEditorDirective

  // instance data

  action: any
  baseType = "string";
  in: Conversion | undefined = undefined;
  out: Conversion | undefined = undefined;

  // getter & setter

  get eventBus() : EventBus<any> {
    return this.group.panel.eventBus
  }

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

  get<T>(property: string) {
    return this.element[property] as T
  }

  set<T>(property: string, value: T) {
     this.element[property] = value
  }

 create(type: string, properties: any) : Element {
    const element = this.element['$model'].create(type)

    for ( const property in properties)
      element[property] = properties[property]

    return element
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

 onChange(value: any) {
    // possible coerce

    if ( this.out ) {
      value = this.out(value)
    }

    const properties = () : any => {
      const result : any = {}

      result[this.property.name] = value

      return result
    }

    // TEST
    const object = [this.property.name].reduce((result : any , property: string) => {
      result[property] = value
      return result
    }, {})

    if (this.action) {
      this.element.set(this.property.name, value)

      // reuse existing action and simply update the new value

      this.action.context.properties[this.property.name] = value

      // still trigger bus

      this.eventBus.fire('commandStack.changed', {trigger: "execute", type: "commandStack.changed"});
    }
    else {
      this.action = this.actionHistory.updateProperties({
        element: this.shape,
        moddleElement: this.element,
        properties: properties()
      })
    }

    // inform listeners

    this.editor.changedValue(value)
  }

  showError(error: ValidationError, select: boolean) {
    this.editor.group.open = true
  }

  // implement onInit

  ngOnInit() {
    // determine in/out coercions

    const value = this.value

    this.in = this.settings.in
    this.out = this.settings.out

    if ( typeof value !== this.baseType && this.in == undefined && this.out == undefined) {
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
