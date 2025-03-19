/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';
import { MatCheckboxModule } from '@angular/material/checkbox';


@RegisterPropertyEditor("Boolean")
@Component({
  selector: "boolean-editor",
  templateUrl: './boolean-editor.html',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCheckboxModule]
})
export class BooleanPropertyEditor extends AbstractPropertyEditor {
  // constructor

  constructor() {
    super()

    this.baseType = "boolean"
  }
}
