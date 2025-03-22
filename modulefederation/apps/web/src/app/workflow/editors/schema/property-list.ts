/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { PropertyPanelModule } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SvgIconComponent } from '../../svg.icon';
import { SchemaEditorComponent } from './schema-editor';
import { PropertyGroupComponent } from '../../property-panel/property-group';
import { Shape } from "bpmn-js/lib/model/Types";

@Component({
  selector: "property-list",
  templateUrl: './property-list.html',
  styleUrl: './property-list.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyPanelModule, SvgIconComponent]
})
export class PropertyListComponent {
  // input

  @Input() properties! : Element[]   
  @Input() shape!: Shape
  @Input() group!: PropertyGroupComponent
  
  // constructor

  constructor(public schema: SchemaEditorComponent) {
  }

  // public


  name(property: Element) {
    if ( property["name"] && property["name"].trim().length > 0)
      return property["name"] + " : " +  property["type"]
    else
      return "<name>" + " : " + property["type"]
  }
}
