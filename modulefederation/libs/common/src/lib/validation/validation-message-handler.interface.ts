import { NgControl } from '@angular/forms';
import { ElementRef } from '@angular/core';

/**
 * An <code>ValidationMessageHandler</code> is responsible to generate an error message given a violation object.
 */
export interface ValidationMessageHandler {
  /**
   * return an error message
   * @param violation the violation object
   * @param control the control
   * @param host the element reference
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string;
}

/**
 * abstract base class for {@link ValidationMessageHandler}s
 */
export abstract class AbstractValidationMessageHandler implements ValidationMessageHandler {
  // abstract

  abstract computeMessage(violation: any, control: NgControl, host: ElementRef): string;

  // protected

  /**
   * return a possible label attached to the corresponding control ( for="..." )
   * @param control the control
   * @param host the element reference
   * @protected
   */
  protected labelFor(control: NgControl, host: ElementRef): string {
    const id = host.nativeElement.id;

    if (id) {
      const label = host.nativeElement.parentElement.querySelector(`label[for="${id}"]`);

      if (label) {
        const text = label.innerText;

        if (text.endsWith(' *'))
          // required elements´´ts get an artificial ' *' after the text in material
          return text.substr(0, text.length - 2);
        else 
          return text;
      }
    }

    // default

    return "";
  }
}
