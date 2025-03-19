/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AbstractExtensionEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';
import { PropertyNameComponent } from '../../property-panel/property-name';



@RegisterPropertyEditor("camunda:ExecutionListener")
@Component({
  selector: "execution-listener-editor",
  templateUrl: './execution-listener.html',
  styleUrl: './execution-listener.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule, PropertyNameComponent]
})
export class ExecutionListenerEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.properties = this.element.$descriptor.properties.filter((prop) => prop.name == "event" || prop.name == "class" ||prop.name == "expression" ) // TODO

  }
}
