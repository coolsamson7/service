/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ValidationModule } from '@modulefederation/common';

@RegisterPropertyEditor("Double")
@Component({
  selector: "double-editor",
  templateUrl: './double-editor.html',
  //styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ValidationModule]
})
export class DoublePropertyEditor extends AbstractPropertyEditor {
   // constructor

   constructor() {
    super()
    
    this.baseType = "number"
  }
}
