import { NG_VALIDATORS, UntypedFormControl } from '@angular/forms';
import { Directive, forwardRef, Input, OnInit } from '@angular/core';
import { Type } from './type';
/**
 * @ignore
 */
function validateTypeFactory(typeDescriptor: Type<any>) {
  return (c: UntypedFormControl) => {
    try {
      typeDescriptor.validate(c.value)

      return null
    }
    catch(e: any) {
      return {
        validateType: {
          type: typeDescriptor,
          violations: e.violations
        }
      }
    }
  }
}

/**
 * this directive
 */
@Directive({
  selector: '[validateType]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidateTypeDirective),
      multi: true
    }
  ]
})
export class ValidateTypeDirective implements OnInit {
  // inputs

  @Input('validateType') public type: string | Type<any> | undefined;

  // instance data

  private validator: Function | undefined;

  // private

  ngOnInit() {
    if (this.type) {
      if (typeof this.type == 'string') 
        this.type = Type.get(this.type);

      this.validator = validateTypeFactory(this.type!);
    }
  }

  // implement OnInit

  validate(c: UntypedFormControl) {
    if (this.validator) 
      return this.validator!(c);
    else 
      return null;
  }
}
