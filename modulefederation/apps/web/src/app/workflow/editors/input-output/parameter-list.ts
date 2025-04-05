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
import { InputOutputEditor } from './input-output';
import { Context } from '../../property-panel/property.editor.directive';

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
  @Input() context!: Context

  @Input() name! : (parameter: Element) => string

  // constructor

  constructor(public parameterEditor: InputOutputEditor) {
  }
}
