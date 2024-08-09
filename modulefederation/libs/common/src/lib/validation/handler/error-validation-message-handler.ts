import { NgControl } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { RegisterValidationMessageHandler } from '../register-validation-message-handler.decorator';
import { AbstractValidationMessageHandler } from '../validation-message-handler.interface';

/**
 * a handler for violations of type 'error' which will simply return the message property.
 */
@RegisterValidationMessageHandler('error')
class CallValidationMessageHandler extends AbstractValidationMessageHandler {
  // implement ValidationMessageHandler

  /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    //const label = this.labelFor(control, host);

    return violation.message;
  }
}
