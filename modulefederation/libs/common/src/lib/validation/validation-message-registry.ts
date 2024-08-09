import { ElementRef, Injectable } from '@angular/core';
import { ValidationMessageHandler } from './validation-message-handler.interface';
import { NgControl } from '@angular/forms';

/**
 * A registry for all known {@link ValidationMessageHandler}
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationMessageRegistry {
  // instance data

  private handlers: { [key: string]: ValidationMessageHandler } = {};

  // public

  /**
   * register a new {@link ValidationMessageHandler}
   * @param validation the validation name
   * @param handler the handler
   */
  public register(validation: string, handler: ValidationMessageHandler) {
    this.handlers[validation] = handler;
  }

  /**
   * compute a localized validation violation message
   * @param validation the validation type
   * @param violation the violation object
   * @param control the associated control
   * @param host the host element
   */
  public computeMessage(validation: string, violation: any, control: NgControl, host: ElementRef): string {
    const handler = this.handlers[validation];

    if (handler) return handler.computeMessage(violation, control, host);
    else return validation; // TODO
    /**throw new Error(
        `unknown validation message handler "${validation}", did you forget to import the ValidationModule?`
      );*/
  }
}
