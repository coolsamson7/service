import { NgControl } from '@angular/forms';
import { ElementRef, Injectable } from '@angular/core';
import { AbstractValidationMessageHandler, RegisterValidationMessageHandler } from '@modulefederation/common';

/**
 * a handler for violations of type 'error' which will simply return the message property.
 */
@RegisterValidationMessageHandler('error')
@Injectable({providedIn: 'root'})
export class CallValidationMessageHandler extends AbstractValidationMessageHandler {
  // implement ValidationMessageHandler

  /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    //const label = this.labelFor(control, host);

    return violation.message;
  }
}
