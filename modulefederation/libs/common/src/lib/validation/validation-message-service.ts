import { ElementRef, Injectable } from '@angular/core';
import { ValidationMessageRegistry } from './validation-message-registry';
import { NgControl } from '@angular/forms';

/**
 * @ignore do we need that?
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationMessageService {
  // constructor

  constructor(private registry: ValidationMessageRegistry) {}

  // public

  public getMessage(validation: string, data: any, control: NgControl, host: ElementRef): string {
    return this.registry.computeMessage(validation, data, control, host);
  }
}
