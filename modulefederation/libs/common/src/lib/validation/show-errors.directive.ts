import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Self,
    TemplateRef,
    ViewContainerRef
  } from '@angular/core';

  import { NgControl } from '@angular/forms';
  import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';

  import { fromEvent, Subject } from 'rxjs';
  import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
  import { ValidationMessageRegistry } from './validation-message-registry';
import { StringBuilder } from '../util';

  /**
   * the dynamic component including the error
   */
  @Component({
    selector: 'mat-error-component',
    standalone: true,
    imports: [MatFormFieldModule],
    template: `
      <mat-error>
        {{ message }}
      </mat-error>
    `
  })
  export class MatErrorComponent implements AfterViewInit  {
    private removeHostElement() {
        // remove host element

        const nativeElement = this.el.nativeElement
        const parentElement = nativeElement.parentElement;

        // move all children out of the element

        while (nativeElement.firstChild) {
            parentElement.insertBefore(nativeElement.firstChild, nativeElement);
        }

        // remove the empty element(the host)

        parentElement.removeChild(nativeElement);
     }

    ngAfterViewInit(): void {
        this.removeHostElement()
    }

    constructor(private el: ElementRef) {

    }
    // instance data

    message = "";

    // input

    @Input()
    set error(value: string) {
      this.message = value;
    }
  }

  /**
   * @ignore
   */
  @Directive({
    selector: '[showErrors1]'
  })
  export class ShowError1Directive implements OnInit, OnDestroy {
    // instance data

    private destroyed$ = new Subject<void>();
    errorRef!: ComponentRef<MatErrorComponent>;

    // constructor

    constructor(
      private vcr: ViewContainerRef,
      private host: ElementRef,
      private resolver: ComponentFactoryResolver,
      private formField: MatFormField,
      private validationMessageRegistry: ValidationMessageRegistry,
      @Optional() @Self() private ngControl: NgControl
    ) {}

    // callback

    private errorMessage(errors: any): string {
      if (!errors) return "";

      const stringBuilder = new StringBuilder();

      for (const error of Object.keys(errors)) {
        const message = errors[error].message;

        if (message) stringBuilder.append(message);
        else
          stringBuilder.append(
            this.validationMessageRegistry.computeMessage(error, errors[error], this.ngControl, this.host)
          );
      }

      return stringBuilder.toString();
    }

    private onStatusChanges() {
      this.setError(this.ngControl.invalid ? this.errorMessage(this.ngControl.errors) : "");
    }

    setError(text: string) {
      if (!this.errorRef) {
        const factory = this.resolver.resolveComponentFactory(MatErrorComponent);
        this.errorRef = this.vcr.createComponent(factory);
      }

      this.errorRef.instance.error = text;
    }

    // implement OnInit

    /**
     * @inheritdoc
     */
    ngOnInit() {
      this.ngControl.statusChanges!
        .pipe(takeUntil(this.destroyed$), distinctUntilChanged())
        .subscribe(() => this.onStatusChanges());

      fromEvent(this.host.nativeElement, 'blur')
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => this.onStatusChanges());
    }

    // implement OnDestroy

    /**
     * @inheritdoc
     */
    ngOnDestroy() {
      this.destroyed$.next();
      this.destroyed$.complete();
    }
  }

  /**
   * @ignore
   *
  // https://github.com/angular/angular/issues/37319
  @Component({
    selector: 'mat-form-field-with-errors',
    template: `
      <mat-form-field>
        <mat-label>
          <ng-content select="mat-label"></ng-content>
        </mat-label>

        <ng-content></ng-content>

        <mat-error></mat-error>

        <input *ngIf="beforeViewInit" matInput hidden />
      </mat-form-field>
    `
  })
  export class MatFormFieldWithErrorsComponent implements AfterViewInit {
    beforeViewInit = true;

    @ContentChild(MatFormFieldControl) control: MatFormFieldControl<any>;
    @ViewChild(MatFormField) matFormField: MatFormField;

    constructor(private cdr: ChangeDetectorRef) {}

    // implement AfterViewInit

    /**
     * @inheritdoc
     *
    ngAfterViewInit() {
      if (this.beforeViewInit) {
        this.matFormField._control = this.control;
        this.beforeViewInit = false;
        this.cdr.detectChanges();
      }
    }
  }*/

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
