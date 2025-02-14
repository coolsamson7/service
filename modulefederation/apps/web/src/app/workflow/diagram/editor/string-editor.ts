/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { RegisterPropertyEditor } from '../property-editor.decorator';
import { AbstractPropertyEditor } from '../abstract-property-editor';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@RegisterPropertyEditor("String")
@Component({
  selector: "string-editor",
  templateUrl: './string-editor.html',
  styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class StringPropertyEditor extends AbstractPropertyEditor {
}

@RegisterPropertyEditor("Boolean")
@Component({
  selector: "boolean-editor",
  templateUrl: './boolean-editor.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class BooleanPropertyEditor extends AbstractPropertyEditor {
}

@RegisterPropertyEditor("Integer")
@Component({
  selector: "integer-editor",
  templateUrl: './integer-editor.html',
  styleUrl: "./string-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class IntegerPropertyEditor extends AbstractPropertyEditor {
}

// TEST

import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Directive} from '@angular/core';
import { NG_VALIDATORS, Validator} from '@angular/forms';
import { ModdleElement } from 'bpmn-js/lib/model/Types';

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

// TEST

@RegisterPropertyEditor("bpmn:id")
@Component({
  selector: "id-editor",
  templateUrl: './id-editor.html',
  styleUrl: "./id-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, UniqueIdDirective]
})
export class IdPropertyEditor extends AbstractPropertyEditor {
}

@RegisterPropertyEditor("bpmn:documentation") // TODO falsch!
@Component({
  selector: "string-area-editor",
  templateUrl: './string-area-editor.html',
  styleUrl: "./string-area-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DocumentationPropertyEditor extends AbstractPropertyEditor implements OnInit {
  get value() : any {
    const values = this.element.get(this.property.name)
    if ( !values )
      return ""
    else {
      if ( values.length == 1)
        return values[0].text
    else
      return ""
    }
  }

  set value(value: any) {
    let values = this.element.get(this.property.name)

    if ( !values ) {
      this.element.set(this.property.name, values = [])
    }

    if (values.length == 0) {
      values.push(this.element.$model.create("bpmn:Documentation"))
    }

    values[0].text = value
  }

  ngOnInit(): void {
    console.log("k")
  }
}
