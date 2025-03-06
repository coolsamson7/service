/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AbstractExtensionEditor, AbstractPropertyEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';



@RegisterPropertyEditor("camunda:ExecutionListener")
@Component({
  selector: "execution-listener-editor",
  templateUrl: './execution-listener.html',
  styleUrl: './execution-listener.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule]
})
export class ExecutionListenerEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.properties = this.config.properties//this.element.$descriptor.properties.filter((prop) => prop.name == "event" || prop.name == "class" ||prop.name == "expression" ) // TODO

  }
}
