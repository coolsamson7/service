/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';


import { AbstractExtensionEditor, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyNameComponent } from '../../property-panel/property-name';


@RegisterPropertyEditor("schema:outputParameter")
@Component({
  selector: "output-parameter",
  templateUrl: './output-parameter.html',
  styleUrl: './output-parameter.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyPanelModule, PropertyNameComponent]
})
export class OutputParameterEditor extends AbstractExtensionEditor {
  // instance data

  name!: Moddle.PropertyDescriptor
  type!: Moddle.PropertyDescriptor
  constraint!: Moddle.PropertyDescriptor

  readOnly = false

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.readOnly = this.context.shape["bpmnElement"].$type == "bpmn:ServiceTask"

      this.name = this.prop("name")
      this.type =  this.prop("type")
      this.constraint = this.prop("constraint")
  }
}
