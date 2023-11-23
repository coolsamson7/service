import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { v4 as uuidv4 } from 'uuid';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { InterfaceDescriptor } from "../model/service.interface";

@Component({
    selector: 'json-view',
    templateUrl: './json.component.html',
    //styleUrls: ['./json.component.scss']
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          multi:true,
          useExisting: JSONComponent
        },
        {
          provide: NG_VALIDATORS,
          multi: true,
          useExisting: JSONComponent
        }
      ]
  })
export class JSONComponent implements OnInit, AfterViewInit, ControlValueAccessor, Validator {
    // input & output

    @Input('schema') schema: any
    @Input('name') name: string

    // children

    @ViewChild('editor') editor

    // instance data

    descriptor : InterfaceDescriptor

    monaco
    editorOptions = {theme: 'vs-dark', language: 'json'};
    editorModel : any
    uri : any
    value = ""

    onChange = (value) => {};
    onTouched = () => {};
    touched = false;  
    disabled = false;

    // callback

    onInit($event) {
        if ( !this.monaco ) {
            this.monaco = (window as any).monaco

            if ( this.schema )
                this.setSchema()

            this.writeValue(this.value)
        }
    }

   newValue(value) {
     this.onChange(this.value = value)
   }

    // private

    private isInitialized() {
        return this.monaco != undefined
    }

    private setSchema() {
        this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: this.uri,
                fileMatch: [this.uri.toString()],
                schema: this.schema
            }]
        })
    }

    //this.onChange(this.quantity);

    private markAsTouched() {
        if (!this.touched) {
          this.onTouched();
          this.touched = true;
        }
      }

     // implement OnInit

     ngOnInit(): void {
        this.uri = uuidv4() + '://' + "schema" + '.json' // for some reason it needs to be unique...looks like a bug in monaco
     }

     // implement AfterviewInit

    ngAfterViewInit(): void {
    }

     // implement Validator
    
     validate(control: AbstractControl<any, any>): ValidationErrors | null {
        const value = control.value

        if ( this.monaco != undefined) {
            let errors = this.monaco.editor.getModelMarkers({owner: 'json'})

            if ( errors.length > 0) {
                let messages = errors.map(error => error.message)

                return {
                    json: {
                        messages: messages
                    }
                }
            }
        }

        return null // for now
    }

    //registerOnValidatorChange?(fn: () => void): void {
    //    throw new Error("Method not implemented.");
    //}

    // implement ControlValueAccessor

    writeValue(value: any): void {
        this.value = value

        if ( this.isInitialized())
            this.editorModel = {
                value: this.value,
                language: 'json',
                uri: this.monaco.Uri.parse( this.uri)
            }
    }

    registerOnChange(onChange: any): void {
         this.onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }
}