import { Component, forwardRef, OnChanges, Input, Output, EventEmitter, NgZone, Inject, Injector, SimpleChanges } from "@angular/core";
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, Validator, FormControl, NgControl, AbstractControl, ValidationErrors } from "@angular/forms";
import { AbstractMonacoEditor } from "./abstract-monaco-editor.component";
import { EditorModel, MONACO_EDITOR_CONFIG, MonacoEditorConfig } from "./monaco-editor";
import { MonacoEditorLoader } from "./monaco-editor-loader";

declare var monaco: any;

@Component({
    selector: 'monaco-editor',
    template: '<div class="editor-container" #editorContainer></div>',
    styles: [`
      :host {
          display: block;
          height: 200px;
      }

      .editor-container {
          width: 100%;
          height: 98%;
      }
  `],
    providers: [
        {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MonacoEditorComponent),
        multi: true
    },
    {
        provide: NG_VALIDATORS,
        multi: true,
        useExisting: forwardRef(() => MonacoEditorComponent),
    }
]
})
export class MonacoEditorComponent extends AbstractMonacoEditor implements ControlValueAccessor, Validator, OnChanges {

    // input & ouput

    @Input('options') 
    set options(options: any) {
        this.editorOptions = Object.assign({}, this.config.defaultOptions, options);
    }

    get options(): any {
        return this.editorOptions;
    }

    @Input('model') model: EditorModel
    @Output() onInit: EventEmitter<MonacoEditorComponent> = new EventEmitter();

    // instance data

    onChange = (_: any) => { };
    onTouched = () => { };
    onErrorStatusChange: () => void = () => {};

    errorMessages : string[] = []

    control: FormControl

    // constructor

    constructor(private zone: NgZone, loader: MonacoEditorLoader, @Inject(MONACO_EDITOR_CONFIG) protected config: MonacoEditorConfig, private injector: Injector) {
        super(loader)
    }

      // implement AfterViewInit

      ngAfterViewInit(): void {
        super.ngAfterViewInit()
        
        const ngControl: NgControl = this.injector.get(NgControl, null);
        if (ngControl) 
          this.control = ngControl.control as FormControl;
       
     } 

    // public

    hasErrors() {
        return this.errorMessages.length > 0
    }
    
    getErrorMessages() {
        return this.errorMessages
    }

    // protected

    protected setupEditor(): void {
        this.uri = monaco.Uri.parse(this.model.uri)

        let model = this.getModel();
        if (!model) 
            model = this.createModel();

        this.createEditor()

        this.editor.setModel(model)

        super.setupEditor()

         // set initial value from the property

         this.writeValue(this.value)
    }

    // override

    createEditor() {
        let editor = super.createEditor()

        // add listeners

        editor.onDidChangeModelContent((e: any) => {
            const value = editor.getValue();

            // value is not propagated to parent when executing outside zone.

           this.zone.run(() => this.onChange( this.value = value) );
        });

        editor.onDidBlurEditorWidget(() => {
            this.onTouched();
        });
      
       // doesnt't work 
       
       editor.onDidChangeModelDecorations(() => { 
            const errorMessages = this.getModelMarkers().map(({ message }) => message);
    
            if (this.errorMessages.length != errorMessages.length) {
                this.errorMessages = errorMessages;

                this.control?.updateValueAndValidity()

                this.onErrorStatusChange();
            }
        });

        // trigger listener

        this.onInit.emit(this);

        // done

        return editor
    }

      // implement Validator

      validate(control: AbstractControl<any, any>): ValidationErrors | null {
        const value = control.value

        if (this.editor) {
            let errors = this.getModelMarkers().map(({ message }) => message);//this.getErrorMessages()

            if (errors.length > 0) {
                return {
                    json: {
                        messages: errors
                    }
                }
            }
        }

        return null // for now
    }


    // implement ControlValueAccessor

    writeValue(value: any): void {
        this.value = value || ''

        //this.editor?.setValue(this.value)

        this.modelInstance?.setValue(this.value)
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    registerOnValidatorChange?(fn: () => void): void {
        this.onErrorStatusChange = fn;
    }

    // implement OnChanges

    ngOnChanges(changes: SimpleChanges) {
        if (this.editor && changes.model  && !changes.model.firstChange) {
          const currentModel = changes.model.currentValue;
          const previousModel = changes.model.previousValue;

          const previousUri = previousModel?.uri
          const currentUri = currentModel?.uri

          if (previousUri != currentUri) {
            const value = this.editor.getValue();

            if (this.modelInstance)
              this.modelInstance.dispose();

            let existingModel;

            if (currentUri)
              existingModel = monaco.editor.getModels().find((model) => model.uri.path === currentUri.path);

            if ( !existingModel)
               this.createModel();

            //this.modelInstance.setValue(this.value)

            this.editor.setModel(this.modelInstance);
          }
        }
    }
}