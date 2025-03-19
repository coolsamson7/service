/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';


import { AbstractExtensionEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyNameComponent } from '../../property-panel/property-name';


@RegisterPropertyEditor("schema:outputParameter")
@Component({
  selector: "output-parameter",
  templateUrl: './output-parameter.html',
  styleUrl: './output-parameter.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule, PropertyNameComponent]
})
export class OutputParameterEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  readOnly = false

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.readOnly = this.shape["bpmnElement"].$type == "bpmn:ServiceTask"

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type"].includes(prop.name))

  }
}
