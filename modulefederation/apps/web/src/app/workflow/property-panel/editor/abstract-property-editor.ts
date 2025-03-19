/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { PropertyEditor } from "./property-editor";
//import { PropertyEditorDirective } from "./property.editor.directive";

import  {Element, PropertyDescriptor  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import CommandStack from 'diagram-js/lib/command/CommandStack';
import { ValidationError } from "../../validation";
import { SuggestionProvider } from "@modulefederation/portal";

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

  // protected

  describe(error: any) {
    return error["model"]
  }

  // private

  getCommandStack() : CommandStack {
    return this.group.panel.commandStack
  }

  canUndo() : boolean {
    return this.action !== undefined
  }

  checkState() {
    this.action = this.findAction()
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

    const commands =  this.getCommandStack()

    if (this.action) {
      this.editor.value = event

      // reuse existing action and simply update the new value

      this.action.context.properties[this.property.name] = event
    }
    else {
      const context = {
        element: this.shape,
        moddleElement: this.element,
        properties: properties()
      }
      commands.execute('element.updateModdleProperties', context)

      this.action =  (<any>commands)["_stack"].find((action: any) => action.context === context)
    }

    // inform listeners

    this.editor.changedValue(event)
  }

  protected findAction() {
    const commands =  this.getCommandStack()

    const stack : any[] =  (<any>commands)["_stack"]
    const index =  (<any>commands)["_stackIdx"]

    for (let i = 0; i < index; i++) {
      const action = stack[i]

      if ( action.command === "element.updateModdleProperties" && action.context.moddleElement === this.element)
        return action
    }

    return undefined
  }


  showError(error: ValidationError, select: boolean) {}

  // implement OnInit

  // implement onInit

  ngOnInit() {
    // find action

    this.action = this.findAction()
  }

   // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    this.action = this.findAction()
  }
}
