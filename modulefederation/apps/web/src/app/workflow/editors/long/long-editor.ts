/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModelValidationDirective } from '../../validation';
import { FormFieldComponent, ValidationModule } from '@modulefederation/common';

import { ValidationError } from "../../validation";

@RegisterPropertyEditor("Long")
@Component({
  selector: "long-editor",
  templateUrl: './long-editor.html',
  //styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective, ValidationModule, FormFieldComponent]
})
export class LongPropertyEditor extends AbstractPropertyEditor<number> {
  // instancne data

  @ViewChild("model") model! : NgModel;
  @ViewChild("input") input! : any;

   // constructor

   constructor() {
    super()
    
    this.baseType = "number"
  }

   // override AbstractPropertyEditor
  
    override showError(error: ValidationError, select: boolean) {
      super.showError(error, select)
  
      this.model.control.markAsTouched()
      if ( select ) {
          this.input.nativeElement.focus()
      }
    }
  
}
