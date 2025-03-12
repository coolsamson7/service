/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';
import { ModelValidationDirective } from '../../validation';

@RegisterPropertyEditor("Boolean")
@Component({
  selector: "boolean-editor",
  templateUrl: './boolean-editor.html',
  standalone: true,
  imports: [FormsModule, CommonModule, ModelValidationDirective]
})
export class BooleanPropertyEditor extends AbstractPropertyEditor {
  describe(error: any) {
    return error["model"]
  } 
}
