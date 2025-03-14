/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModelValidationDirective } from '../../validation';


@RegisterPropertyEditor("String")
@Component({
  selector: "string-editor",
  templateUrl: './string-editor.html',
  styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective]
})
export class StringPropertyEditor extends AbstractPropertyEditor {
  describe(error: any) {
    return error["model"]
  } 
}
