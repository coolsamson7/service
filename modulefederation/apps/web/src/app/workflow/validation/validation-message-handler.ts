import { ElementRef, Injectable } from "@angular/core";
import { NgControl } from "@angular/forms";
import { AbstractValidationMessageHandler, RegisterValidationMessageHandler } from "@modulefederation/common";

@RegisterValidationMessageHandler('model')
@Injectable({providedIn: "root"})
export class ModelValidationMessageHandler extends AbstractValidationMessageHandler {
  // implement ValidationMessageHandler

  /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    const label = this.labelFor(control, host);

    return violation;
  }
}