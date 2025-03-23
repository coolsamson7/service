/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { PropertyPanelModule } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SvgIconComponent } from '../../svg.icon';
import { PropertyGroupComponent } from '../../property-panel/property-group';
import { Shape } from "bpmn-js/lib/model/Types";
import { InputOutputEditor } from './input-output';

@Component({
  selector: "parameter-list",
  templateUrl: './parameter-list.html',
  styleUrl: './parameter-list.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, PropertyPanelModule, SvgIconComponent]
})
export class ParameterListComponent {
  // input

  @Input() parameters! : Element[]
  @Input() shape!: Shape
  @Input() group!: PropertyGroupComponent

  // constructor

  constructor(public parameterEditor: InputOutputEditor) {
  }

  // public

  name(property: Element) {
    if ( property["name"] && property["name"].trim().length > 0)
      return property["name"] + " : " +  property["type"] + " = " + property["value"]
    else
      return "<name>" + " : " + property["type"]
  }
}
