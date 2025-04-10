/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild, OnInit } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModelValidationDirective, ValidationError } from '../../validation';
import { NgModelSuggestionsDirective } from '@modulefederation/portal';
import { MatSelectModule } from '@angular/material/select';
import { ValidationModule } from '@modulefederation/common';



@RegisterPropertyEditor("String")
@Component({
  selector: "string-editor",
  templateUrl: './string-editor.html',
  styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective, NgModelSuggestionsDirective, MatSelectModule, ValidationModule]
})
export class StringPropertyEditor extends AbstractPropertyEditor<string> implements OnInit {
  // instance data

  @ViewChild("model") model! : NgModel;
  @ViewChild("input") input! : any;

  inputType : "input" | "suggestionInput" | "select" = "input"


  // override AbstractPropertyEditor

  override showError(error: ValidationError, select: boolean) {
    super.showError(error, select)

    this.model.control.markAsTouched()
    if ( select ) {
        this.input.nativeElement.focus()
    }
  }

  // implement onInit

  override ngOnInit() {
    super.ngOnInit()

     // determine input type

    this.inputType = "input"
    if ( this.settings.suggestionProvider)
      this.inputType = "suggestionInput"
    else if (this.settings.oneOf)
      this.inputType = "select"
  }
}
