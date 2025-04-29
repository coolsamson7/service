/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Directive} from '@angular/core';
import { NG_VALIDATORS, Validator} from '@angular/forms';
import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormFieldComponent, ValidationModule } from '@modulefederation/common';

export function createUniqueIdValidator(element: ModdleElement): ValidatorFn {
  let process = element

  while (process.$type !== "bpmn:Process")
    process = process.$parent;

  const ids : string[] = []
  for ( const child of process.flowElements)
    if ( child !== element)
      ids.push(child.id)

  return (control:AbstractControl) : ValidationErrors | null => {
    const value = control.value;
    if (!value)
      return null;

    const duplicate = ids.includes(value)

    return duplicate ? {uniqueId:true}: null;
    }
}

@Directive({
  selector: "[uniqueId]",
  providers: [{
    useExisting: UniqueIdDirective,
    provide: NG_VALIDATORS,
    multi: true
  }],
  standalone: true
})
export class UniqueIdDirective implements Validator {
  @Input("uniqueId") element : ModdleElement

  // implement Validator

  validate(control: AbstractControl): ValidationErrors | null {
    return createUniqueIdValidator(this.element)(control);
  }
}

@RegisterPropertyEditor("bpmn:id")
@Component({
  selector: "id-editor",
  templateUrl: './id-editor.html',
  styleUrl: "./id-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, UniqueIdDirective,  MatInputModule, MatFormFieldModule, FormFieldComponent, ValidationModule]
})
export class IdPropertyEditor extends AbstractPropertyEditor {
}
