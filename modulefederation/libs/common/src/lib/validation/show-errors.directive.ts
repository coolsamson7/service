import {
    AfterViewInit,
    Directive,
    ElementRef,
    OnDestroy,
    TemplateRef,
    ViewContainerRef
  } from '@angular/core';

import { NgControl } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import {  Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ValidationMessageRegistry } from './validation-message-registry';
import { StringBuilder } from '../util';

  

/**
 * Set this directive on a mat-error in order to automatically turn it on and off and supply the generated messages.
 */
@Directive({ selector: '[showErrors]' })
export class ShowErrorDirective implements AfterViewInit, OnDestroy {
  // instance data

  private destroyed$ = new Subject<void>();
  private ngControl!: NgControl;
  matErrorEl: any;

  // constructor

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private validationMessageRegistry: ValidationMessageRegistry,
    private host: ElementRef,
    private formField: MatFormField
  ) {
  }

  // private

  private errorMessage(errors: any): string {
      if (!errors) return "";

      const stringBuilder = new StringBuilder();

      const keys = Object.keys(errors);
      const list = keys.length > 1;

      if (list) stringBuilder.append('<ul>');

      for (const error of Object.keys(errors)) {
        const message = errors[error].message;

        if (list) stringBuilder.append('<li>');

        if (message)
          stringBuilder.append(message);
        else
          stringBuilder.append(this.validationMessageRegistry.computeMessage(error, errors[error], this.ngControl, this.host));

        if (list) stringBuilder.append('</li>');
      }

      if (list) stringBuilder.append('</ul>');

      // done

      return stringBuilder.toString();
    }

    private onStatusChanges() {
      this.setError(this.ngControl.invalid ? this.errorMessage(this.ngControl.errors) : "");
    }

    setError(text: string) {
      if (text?.startsWith('<ul>'))
          this.matErrorEl.innerHTML = text;
      else
          this.matErrorEl.innerText = text;
    }

  // implement OnInit

  ngAfterViewInit(): void {
    this.ngControl = this.formField._control.ngControl as NgControl;

    const viewRef = this.viewContainer.createEmbeddedView(this.templateRef);
    this.matErrorEl = viewRef.rootNodes[0];

    this.ngControl.statusChanges!
      .pipe(takeUntil(this.destroyed$), distinctUntilChanged())
      .subscribe(() => this.onStatusChanges());

  }

  // implement OnDestroy

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
