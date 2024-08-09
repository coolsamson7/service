import { NgControl } from '@angular/forms';
import { ElementRef, Injectable } from '@angular/core';
import { AbstractValidationMessageHandler, RegisterValidationMessageHandler, ValidationMessageManager } from '@modulefederation/common';

/**
 * handler for required violations
 */
@RegisterValidationMessageHandler('validateType')
@Injectable({providedIn: 'root'})
export class TypeViolationMessageHandler extends AbstractValidationMessageHandler {
  // constructor

  constructor(private manager: ValidationMessageManager) {
    super();
  }

  // override AbstractValidationMessageHandler

    /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    const label = this.labelFor(control, host);

    console.log(violation)

    return this.manager.provide({
      violations: violation.violations,
      //type: violation.violations[0].type,
      violation: violation.violations[0],
      label: label
    })
  }
}
