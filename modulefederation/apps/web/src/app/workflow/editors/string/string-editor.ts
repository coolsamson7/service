/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModelValidationDirective, ValidationError } from '../../validation';
import { NgModelSuggestionsDirective } from '@modulefederation/portal';
import { MatSelectModule } from '@angular/material/select';
import CommandStack from 'diagram-js/lib/command/CommandStack';


@RegisterPropertyEditor("String")
@Component({
  selector: "string-editor",
  templateUrl: './string-editor.html',
  styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective, NgModelSuggestionsDirective, MatSelectModule]
})
export class StringPropertyEditor extends AbstractPropertyEditor<string> implements OnInit, OnChanges {
  // instance data

  @ViewChild("model") model! : NgModel;
  @ViewChild("input") input! : any;

  inputType : "input" | "suggestionInput" | "select" = "input"

  action: any

  // public

  describe(error: any) {
    return error["model"]
  } 

  // private

  getCommandStack() : CommandStack {
    return this.group.panel.commandStack
  }

  // override AbstractPropertyEditor

  override showError(error: ValidationError, select: boolean) {
    this.editor.group.open = true

    this.model.control.markAsTouched()
    if ( select ) {
        this.input.nativeElement.focus()
    }
  }

  canUndo() : boolean {
    return this.action !== undefined
  }

  override undo() : void {
    if ( this.action) {

      this.action = undefined
    }
  }

  override isDirty() : boolean  {
    console.log(this.property.name + ".dirty = " + this.canUndo())
    return this.canUndo()
  }

  override onChange(event: any) {
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

      if ( this.action )
        console.log(this.property.name + " has an action")
    } 
  }

  private findAction() {
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

  // implement onInit

  ngOnInit() {
    // find action

    this.action = this.findAction()

     // determine input type

    this.inputType = "input"
    if ( this.hints.suggestionProvider)
      this.inputType = "suggestionInput"
    else if (this.hints.oneOf)
      this.inputType = "select"
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    this.action = this.findAction()
  }
}
