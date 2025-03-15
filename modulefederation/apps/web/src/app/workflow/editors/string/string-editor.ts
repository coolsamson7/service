/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModelValidationDirective, ValidationError } from '../../validation';
import { NgModelSuggestionsDirective } from '@modulefederation/portal';
import { MatSelectModule } from '@angular/material/select';


@RegisterPropertyEditor("String")
@Component({
  selector: "string-editor",
  templateUrl: './string-editor.html',
  styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective, NgModelSuggestionsDirective, MatSelectModule]
})
export class StringPropertyEditor extends AbstractPropertyEditor<string> implements OnInit {
  // instance data

  @ViewChild("input") input! : NgModel;

  inputType : "input" | "suggestionInput" | "select" = "input"

  // public

  describe(error: any) {
    return error["model"]
  } 

  // implement onInit

  ngOnInit() {
    this.inputType = "input"
    if ( this.hints.suggestionProvider)
      this.inputType = "suggestionInput"
    else if (this.hints.oneOf)
      this.inputType = "select"
  }

   override showError(error: ValidationError) {
    console.log("eee")
    this.input.control.markAsTouched() // ??
   }
}
