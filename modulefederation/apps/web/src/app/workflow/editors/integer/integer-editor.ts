/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModelValidationDirective } from '../../validation';
import { ValidationModule } from '@modulefederation/common';

import { ValidationError } from "../../validation";

@RegisterPropertyEditor("Integer")
@Component({
  selector: "integer-editor",
  templateUrl: './integer-editor.html',
  //styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective, ValidationModule]
})
export class IntegerPropertyEditor extends AbstractPropertyEditor<number> {
  // instance data

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
