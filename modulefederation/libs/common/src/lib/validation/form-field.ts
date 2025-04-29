import { CommonModule } from "@angular/common";
import { Component, AfterViewInit, ContentChild, ViewChild, ChangeDetectorRef, ElementRef } from "@angular/core";
import { FormsModule, NgControl } from "@angular/forms";
import { MatFormFieldModule, MatFormFieldControl, MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { StringBuilder } from "../util";
import { ValidationMessageRegistry } from "./validation-message-registry";

@Component({
    selector: 'form-field',
    template: `
      <mat-form-field>
        <mat-label>
          <ng-content select="mat-label"></ng-content>
        </mat-label>
  
        <ng-content></ng-content>
  
        <mat-error>{{error}}</mat-error>
  
        <!-- we need a hidden input to make the form field work with the mat-form-field control -->
  
        <input *ngIf="isBeforeViewInit$$ | async" hidden matInput />
      </mat-form-field>`,
    standalone: true,
  
    imports: [
      // angular
  
      CommonModule,
      FormsModule,
  
      // material
  
      MatInputModule,
      MatFormFieldModule
    ]
  })
  export class FormFieldComponent implements AfterViewInit {
    // instance data
  
    isBeforeViewInit$$ = new BehaviorSubject(true);
    @ContentChild(MatFormFieldControl) control!: MatFormFieldControl<any>;
    @ViewChild(MatFormField) matFormField!: MatFormField;
  
  
    get ngControl(): NgControl {
      return this.control.ngControl as NgControl
  }
  
    error = ""
  
    // constructor
  
    constructor(private cdr: ChangeDetectorRef,  private validationMessageRegistry: ValidationMessageRegistry,  private host: ElementRef) {}
  
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
  
    setError(text: string) {
      /*if (text?.startsWith('<ul>'))
          this.matErrorEl.innerHTML = text;
      else
          this.matErrorEl.innerText = text;*/
  
          this.error = text
    }
  
  
    private onStatusChanges() {
      this.setError(this.ngControl.invalid ? this.errorMessage(this.ngControl.errors) : "");
    }
  
    // implement AfterViewInit
  
    /**
     * @inheritdoc
     */
    ngAfterViewInit() {
    
      this.matFormField._control = this.control;
  
      this.matFormField.ngAfterContentInit();
  
      this.cdr.detectChanges();
  
      setTimeout(() => this.isBeforeViewInit$$.next(false), 0);
  
      this.ngControl.statusChanges!.pipe(
        //takeUntil(this.destroyed$),
         distinctUntilChanged()).subscribe(() => this.onStatusChanges())
    }
  }
  