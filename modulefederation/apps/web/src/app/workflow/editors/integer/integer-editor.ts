/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { AbstractExtensionEditor, AbstractPropertyEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@RegisterPropertyEditor("Integer")
@Component({
  selector: "integer-editor",
  templateUrl: './integer-editor.html',
  //styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class IntegerPropertyEditor extends AbstractPropertyEditor {
}
