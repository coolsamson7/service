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
import { ChipsComponent } from './chips.component';

@RegisterPropertyEditor("schema:Constraint")
@Component({
  selector: "constraint-editor",
  templateUrl: './constraint-editor.html',
  //styleUrl: "./constraint-editor.scss",
  standalone: true,
  imports: [
    // angular

    FormsModule,
    CommonModule,

    // material

    MatInputModule,
     MatFormFieldModule,

    // more

    //ModelValidationDirective,

    ValidationModule,

    ChipsComponent
    ]
})
export class ConstraintPropertyEditor extends AbstractPropertyEditor<number> {
  // instance data

  @ViewChild("model") model! : NgModel;
  @ViewChild("input") input! : any;

   get type() :string {
    switch (this.element["type"]) {
      case "Integer":
      case "Short":
      case "Long":
      case "Double":
        return "number"
        break
      case "String":
        return "string";
        break
       default:
          return "string"
      }
    }

   // constructor

   constructor() {
    super()

    this.baseType = "string"
  }

  override ngOnInit() {
    super.ngOnInit()

    if ( !this.get("constraint"))
      this.set("constraint", "min 1")
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
