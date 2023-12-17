import { AbstractControlDirective,
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
    NgControl
} from "@angular/forms";

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from "@angular/material/chips";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Component, ElementRef, Inject, Input, OnDestroy, Optional, Self, ViewChild } from "@angular/core";
import { map, Observable, startWith, Subject } from "rxjs";
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from "@angular/material/form-field";


@Component({
    selector: 'chips',
    templateUrl: "chips.component.html",
    styleUrls: ["chips.component.scss"],
    providers: [
        {provide: MatFormFieldControl, useExisting: ChipsComponent}
        /*{
            provide: NG_VALUE_ACCESSOR,
            multi:true,
            useExisting: ChipsComponent
        }*/
    ]
})
export class ChipsComponent implements ControlValueAccessor, MatFormFieldControl<ChipsComponent>, OnDestroy {
    // input

    @Input() allValues : string[] = [];
    @Input() placeholder : string

    // instance data

    values : string[] = [];
    onChange = (value) => {
    };
    onTouched = () => {
    };

    touched = false;
    disabled = false;

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    @ViewChild('input') input : ElementRef<HTMLInputElement>;
    @ViewChild('autocomplete') autocomplete : MatAutocomplete;

    filteredValues : Observable<string[]>;

    formControl = new FormControl();

    stateChanges = new Subject<void>();

    // constructor

    constructor(private _elementRef: ElementRef<HTMLElement>,
                @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
                @Optional() @Self() public ngControl: NgControl,
    ) {
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }

        this.filteredValues = this.formControl.valueChanges.pipe(
            startWith(null),
            map((value : string | null) => value ? this.filterValues(value) : this.allValues.slice()));
    }

    // private

    private filterValues(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allValues.filter(value => value.toLowerCase().indexOf(filterValue) === 0);
    }

    add(event: MatChipInputEvent): void {
        if (!this.autocomplete.isOpen) {
            this.markAsTouched()

            const input = event.input;
            const value = event.value;

            if ((value || '').trim()) {
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

    remove(value: string): void {
        const index = this.values.indexOf(value);

        if (index >= 0) {
            this.values.splice(index, 1);

            this.markAsTouched()
            this.onChange(this.values = [...this.values])
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.markAsTouched()

        this.values.push(event.option.viewValue);

        this.onChange([...this.values])

        this.input.nativeElement.value = '';
        this.formControl.setValue(null);
    }

    // implement ControlValueAccessor

    writeValue(values: string[]) {
        this.values = values;
    }

    registerOnChange(onChange: any) {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any) {
        this.onTouched = onTouched;
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
    }

    // implement MatFormFieldControl


    value: ChipsComponent;
    //stateChanges: Observable<void>;
    id: string;
    //placeholder: string;
    //ngControl: NgControl | AbstractControlDirective;
    focused: boolean;
    empty: boolean;
    shouldLabelFloat: boolean;
    required: boolean;
    errorState: boolean;
    controlType?: string;
    autofilled?: boolean;
    userAriaDescribedBy?: string;

    setDescribedByIds(ids: string[]): void {
        //throw new Error("Method not implemented.");
    }
    onContainerClick(event: MouseEvent): void {
        //throw new Error("Method not implemented.");
    }


    // implement OnDestroy

    ngOnDestroy() {
    }
}
