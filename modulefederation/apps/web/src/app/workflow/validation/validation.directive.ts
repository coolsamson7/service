/* eslint-disable @angular-eslint/no-input-rename */
import { Directive, Input } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";
import { ModelValidation } from "./validation";
import { Element } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { Process } from "bpmn-moddle";
import { Context } from "../property-panel/property.editor.directive";


export function createModelValidator(modelValidation: ModelValidation, shape: Shape, element: Element, property: string): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      const value = control.value;

      let process : Element = element; // TODO
      while ( process.$type !== "bpmn:Process")
        process = process.$parent
    
      const errors = modelValidation.validateElement(process as any as Process, shape, element).filter(error => error.property == property)
  
      return errors.length > 0  ? {model: errors[0].error}: null; // ??
    }
  }

@Directive({
  selector: "[check]",
  providers: [{
    useExisting: ModelValidationDirective,
    provide: NG_VALIDATORS,
    multi: true
  }],
  standalone: true
})
export class ModelValidationDirective implements Validator {
  @Input("check") element!: Element
  @Input() context!: Context
  @Input("property") property!: string

  // constructor

  constructor(private modelValidation: ModelValidation) {
  }

  // implement Validator

  validate(control: AbstractControl): ValidationErrors | null {
    // for whatever reason the validator is sometimes called before the model has been updated

    if ( control.value !== this.element[this.property]) {
      setTimeout(() => control.updateValueAndValidity(), 0)
      return null
    }
    else return createModelValidator(this.modelValidation, this.context.shape, this.element, this.property)(control);
  }
}