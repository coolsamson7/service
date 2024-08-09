import { NgControl } from '@angular/forms';
import { ElementRef, Injectable } from '@angular/core';
import { AbstractValidationMessageHandler, RegisterValidationMessageHandler } from '@modulefederation/common';
import { Translator } from '../../i18n';


/**
 * handler for required violations
 */
@RegisterValidationMessageHandler('required')
@Injectable({providedIn: 'root'})
export class RequiredValidationMessageHandler extends AbstractValidationMessageHandler {
  // constructor

  constructor(private translator: Translator) {
    super();
  }

  // override AbstractValidationMessageHandler

  /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    const label = this.labelFor(control, host);

    return label ?
      this.translator.translate('validation:violation.requiredLabel.label', {label: label}) :
      this.translator.translate('validation:violation.required.label');
  }
}
