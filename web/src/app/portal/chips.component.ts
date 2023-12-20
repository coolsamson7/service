import { ControlValueAccessor, FormControl, NgControl } from "@angular/forms";

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from "@angular/material/chips";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, Optional, Self, ViewChild } from "@angular/core";
import { map, Observable, startWith, Subject } from "rxjs";
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from "@angular/material/form-field";


@Component({
  selector: 'chips',
  templateUrl: "chips.component.html",
  styleUrls: ["chips.component.scss"],
  providers: [{provide: MatFormFieldControl, useExisting: ChipsComponent}]
})
export class ChipsComponent implements ControlValueAccessor, MatFormFieldControl<string[]>, OnDestroy {
  // constants

  static nextId = 0;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // input
  @Input() allValues : string[] = [];
  @Input() allowNew = true;
  values : string[] = [];
  touched = false;
  filteredValues : Observable<string[]>;

  // instance data
  formControl = new FormControl();
  stateChanges = new Subject<void>();
  @ViewChild('input') input : ElementRef<HTMLInputElement>;
  @ViewChild('autocomplete') autocomplete : MatAutocomplete;
  //stateChanges: Observable<void>;
  @HostBinding()
  id : string = `chips-${ChipsComponent.nextId++}`
  //ngControl: NgControl | AbstractControlDirective;
  focused : boolean;
  errorState : boolean = false
  controlType = "chips";
  autofilled? : boolean;
  userAriaDescribedBy? : string;

  // children

  constructor(private _elementRef : ElementRef<HTMLElement>,
              @Optional() @Inject(MAT_FORM_FIELD) public _formField : MatFormField,
              @Optional() @Self() public ngControl : NgControl,
  ) {
    if (this.ngControl != null)
      this.ngControl.valueAccessor = this;

    this.filteredValues = this.formControl.valueChanges.pipe(
      startWith(null),
      map((value : string | null) => value ? this.filterValues(value) : this.allValues.slice()));
  }

  private _placeholder : string;

  // constructor

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  // callbacks

  set placeholder(placeholder) {
    this._placeholder = placeholder;

    this.stateChanges.next();
  }

  private _disabled = false;

  // private

  @Input()
  get disabled() : boolean {
    return this._disabled;
  }

  set disabled(value : boolean) {
    this._disabled = value;
    // TODO?

    this.stateChanges.next();
  }

  @Input()
  get value() : string[] | null {
    return this.values
  }

  set value(value : string[] | null) {
    this.values = value

    this.stateChanges.next();
  }

  // implement ControlValueAccessor

  //empty: boolean;
  get empty() {
    return this.values.length == 0;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  private _required = false;

  @Input()
  get required() {
    return this._required;
  }

  set required(req : boolean) {
    this._required = req;
    this.stateChanges.next();
  }

  // implement MatFormFieldControl

  onChange = (value) => {
  };

  onTouched = () => {
  };

  //value: ChipsComponent;

  onFocusIn(event : FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }
  //placeholder: string;

  onFocusOut(event : FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  add(event : MatChipInputEvent) : void {
    if (!this.autocomplete.isOpen && event.value) {
      const input = event.input;
      const value = event.value.trim();

      if (value.length > 0 && !this.values.includes(value) && (this.allowNew || !this.allValues.includes(value))) {
        this.values = [...this.values, value.trim()]

        this.markAsTouched()
        this.onChange(this.values)
      }

      // reset the input value

      if (input)
        input.value = '';

      this.formControl.setValue(null);
    }
  }

  remove(value : string) : void {
    const index = this.values.indexOf(value);

    if (index >= 0) {
      this.values = [...this.values]
      this.values.splice(index, 1);

      this.markAsTouched()
      this.onChange(this.values)
    }
  }

  selected(event : MatAutocompleteSelectedEvent) : void {
    this.markAsTouched()

    let add = event.option.viewValue

    if (!this.values.includes(add)) {
      this.onChange(this.values = [...this.values, add])
    }

    this.input.nativeElement.value = '';
    this.formControl.setValue(null);
  }

  writeValue(values : string[]) {
    this.values = values;
  }

  registerOnChange(onChange : any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched : any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled : boolean) {
    this.disabled = disabled;
  }

  setDescribedByIds(ids : string[]) : void {
    //throw new Error("Method not implemented.");
  }

  onContainerClick(event : MouseEvent) : void {
    //throw new Error("Method not implemented.");
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  // implement OnDestroy

  private filterValues(value : string) : string[] {
    const filterValue = value.toLowerCase();

    return this.allValues.filter(value => value.toLowerCase().indexOf(filterValue) === 0);
  }
}
