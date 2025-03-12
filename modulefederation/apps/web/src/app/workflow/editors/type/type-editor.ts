/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@RegisterPropertyEditor("schema:type")
@Component({
  selector: "type-editor",
  templateUrl: './type-editor.html',
  styleUrl: "./type-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatFormFieldModule, MatSelectModule]
})
export class TypePropertyEditor extends AbstractPropertyEditor {
  types = ["String", "Boolean"]
}
