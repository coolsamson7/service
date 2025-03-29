/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/no-output-on-prefix */
import {
    Component,
    EventEmitter,
    forwardRef,
    Inject,
    Injector,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ElementRef
} from "@angular/core";
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    NgControl,
    ValidationErrors,
    Validator
} from "@angular/forms";
import { AbstractMonacoEditor } from "./abstract-monaco-editor.component";
import { EditorModel, MONACO_EDITOR_CONFIG, MonacoEditorConfig } from "./monaco-editor";
import { MonacoEditorLoader } from "./monaco-editor-loader";

declare let monaco : any;

@Component({
    selector: 'monaco-editor',
    template: '<div class="editor-container" #editorContainer></div>',
    styles: [`
      :host {
          display: block;
          height:100%;
      }

      .editor-container {
          width: 100%;
          height: 98%;

          .monaco-editor {
          color: red;
            height: 100%;
          }
      }

        .monaco-editor {
                color: red;
                  height: 100%;
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

    @Input() declare model : EditorModel
    @Output() onInit : EventEmitter<MonacoEditorComponent> = new EventEmitter();
    errorMessages : string[] = []
    control! : FormControl

    // instance data

    constructor(zone : NgZone, loader : MonacoEditorLoader, @Inject(MONACO_EDITOR_CONFIG) protected config : MonacoEditorConfig, private injector : Injector, el: ElementRef) {
        super(loader, el, zone)
    }

    get options() : any {
        return this.editorOptions;
    }

    @Input()
    set options(options : any) {
        this.editorOptions = Object.assign({}, this.config.defaultOptions, options);

        this.editorOptions.automaticLayout = true
    }

    onChange = (_ : any) => { /** noop */}

    onTouched = () => { /** noop */}

    onErrorStatusChange : () => void = () => { /** noop */ }

    // implement AfterViewInit

    override ngAfterViewInit() : void {
        super.ngAfterViewInit()

        const ngControl : NgControl | null = this.injector.get(NgControl, null);
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

    override createEditor() {
        const editor = super.createEditor()

        // add listeners

        editor.onDidChangeModelContent((e : any) => {
            const value = editor.getValue();

            // value is not propagated to parent when executing outside zone.

            this.zone.run(() => this.onChange(this.value = value));
        });

        editor.onDidBlurEditorWidget(() => {
            this.onTouched();
        });

        // doesn't work

        editor.onDidChangeModelDecorations(() => {
            // @ts-ignore
            const errorMessages = this.getModelMarkers().map(({message}) => message);

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

    // override

    validate(control : AbstractControl<any, any>) : ValidationErrors | null {

        if (this.editor) {
            // @ts-ignore
            const errors = this.getModelMarkers().map(({message}) => message);//this.getErrorMessages()

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

    // implement Validator

    writeValue(value : any) : void {
        this.value = value || ''

        //this.editor?.setValue(this.value)

        this.modelInstance?.setValue(this.value)

        this.editor?.getAction('editor.action.formatDocument').run()
    }


    // implement ControlValueAccessor

    registerOnChange(fn : any) : void {
        this.onChange = fn;
    }

    registerOnTouched(fn : any) : void {
        this.onTouched = fn;
    }

    registerOnValidatorChange?(fn : () => void) : void {
        this.onErrorStatusChange = fn;
    }

    ngOnChanges(changes : SimpleChanges) {
        if (this.editor && changes["model"] && !changes["model"].firstChange) {
            const currentModel = changes["model"].currentValue;
            const previousModel = changes["model"].previousValue;

            const previousUri = previousModel?.uri
            const currentUri = currentModel?.uri

            if (previousUri != currentUri) {
                const value = this.editor.getValue();

                if (this.modelInstance)
                    this.modelInstance.dispose();

                let existingModel;

                if (currentUri)
                    existingModel = monaco.editor.getModels().find((model : any) => model.uri.path === currentUri.path);

                if (!existingModel)
                    this.createModel();

                //this.modelInstance.setValue(this.value)

                this.editor.setModel(this.modelInstance);
            }
        }
    }

    // implement OnChanges

    protected override setupEditor() : void {
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
}
