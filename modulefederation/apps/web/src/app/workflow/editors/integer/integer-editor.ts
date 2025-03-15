/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModelValidationDirective } from '../../validation';

@RegisterPropertyEditor("Integer")
@Component({
  selector: "integer-editor",
  templateUrl: './integer-editor.html',
  //styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, ModelValidationDirective]
})
export class IntegerPropertyEditor extends AbstractPropertyEditor<number> {
  describe(error: any) {
    return error["model"]
  } 
}
