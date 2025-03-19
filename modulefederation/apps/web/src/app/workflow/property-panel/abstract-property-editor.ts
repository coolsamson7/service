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

export interface EditorHints<T> {
  suggestionProvider?: SuggestionProvider
  oneOf?: T[]
}

@Component({
  template: '<div></div>'
})
export abstract class AbstractPropertyEditor<T=any> implements PropertyEditor<T>, OnInit, OnChanges {
  // input

  @Input() shape!: Shape
  @Input() element!: Element
  @Input() readOnly = false
  @Input() property!: PropertyDescriptor
  @Input() hints : EditorHints<T> = {}
  @Input() group!: any//PropertyEditorDirective
  @Input() editor!: any//PropertyEditorDirective
  @Input() v!: any//PropertyEditorDirective

  // instance data

  action: any

  // getter & setter

  get value() : any {
    return this.element.get(this.property.name)
  }

  set value(value: any) {
    this.element.set(this.property.name, value)
  }

  get actionHistory() : ActionHistory {
    return this.group.panel.actionHistory
  }

  // protected

  describe(error: any) {
    return error["model"]
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
      /*const context = {
        element: this.shape,
        moddleElement: this.element,
        properties: properties()
      }
      commands.execute('element.updateModdleProperties', context)

      this.action =  (<any>commands)["_stack"].find((action: any) => action.context === context)
*/
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
/*
  protected findActionX() {
    const commands =  this.getCommandStack()

    const stack : any[] =  (<any>commands)["_stack"]
    const index =  (<any>commands)["_stackIdx"]

    for (let i = 0; i <= index; i++) {
      const action = stack[i]

      if ( action.command === "element.updateModdleProperties" && action.context.moddleElement === this.element && action.context.properties[this.property.name])
        return action
    }

    return undefined
  }*/


  showError(error: ValidationError, select: boolean) {}

  // implement onInit

  ngOnInit() {
    // find action

    this.checkState()
  }

   // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    this.checkState()
  }
}
