import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, OnDestroy, Inject, ElementRef, NgModule, ModuleWithProviders, NgZone, forwardRef, Injectable } from "@angular/core";
import { v4 as uuidv4 } from 'uuid';
import { InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { InterfaceDescriptor } from "../model/service.interface";
import { BehaviorSubject, Subscription, filter, fromEvent, take } from 'rxjs';

@Component({
    selector: 'json-view',
    templateUrl: './json.component.html',
    //styleUrls: ['./json.component.scss']
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
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

    descriptor: InterfaceDescriptor

    monaco
    editorOptions = { theme: 'vs-dark', language: 'json' };
    editorModel: any
    uri: any
    value = ""

    onChange = (value) => { };
    onTouched = () => { };
    touched = false;
    disabled = false;

    // callback from monaco editor when loaded

    onInit($event) {
        if (!this.monaco) {
            this.monaco = (window as any).monaco

            this.editorModel = {
                value: this.value,
                language: 'json',
                uri: this.monaco.Uri.parse(this.uri)
            }

            if (this.schema)
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

        if (this.monaco != undefined) {
            let errors = this.monaco.editor.getModelMarkers({ owner: 'json' })

            if (errors.length > 0) {
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

    // implement ControlValueAccessor

    writeValue(value: any): void {
        this.value = value

        if (this.isInitialized()) {
            const model = monaco.editor.getModel(this.uri);

            if (model) {
                model.setValue(value)
                //options.model = model;
                //options.model.setValue(this.value);
            } 

            //this.editor.writeValue(value)
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

// monaco stuff

export interface EditorModel {
    value: string;
    language?: string;
    uri?: any;
}


export const MONACO_EDITOR_CONFIG = new InjectionToken('MONACO_EDITOR_CONFIG');

export interface MonacoEditorConfig {
    baseUrl?: string;
    requireConfig?: { [key: string]: any; };
    defaultOptions?: { [key: string]: any; };
    monacoRequire?: Function;
    onMonacoLoad?: Function;
}

@Injectable({ providedIn: 'root' })
export class MonacoEditorLoader {
    // instance data

    isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // constructor

    constructor(private ngZone: NgZone, @Inject(MONACO_EDITOR_CONFIG) protected config: MonacoEditorConfig) {
        if (typeof ((<any>window).monaco) === 'object')
            this.loaded()
        else
            this.load()
    }

    // private


    private load() {
        const baseUrl = this.config.baseUrl || "./assets";

        const onGotAmdLoader: any = (require?: any) => {
            let usedRequire = require || (<any>window).require;
            let requireConfig = { paths: { vs: `${baseUrl}/monaco/min/vs` } };
            Object.assign(requireConfig, this.config.requireConfig || {});

            // Load monaco

            usedRequire.config(requireConfig);
            usedRequire([`vs/editor/editor.main`], () => {
                if (typeof this.config.onMonacoLoad === 'function') {
                    this.config.onMonacoLoad();
                }

                this.loaded();
            });
        };

        if (this.config.monacoRequire) {
            onGotAmdLoader(this.config.monacoRequire);

            // Load AMD loader if necessary
        }
        else if (!(<any>window).require) {
            const loaderScript: HTMLScriptElement = document.createElement('script');

            loaderScript.type = 'text/javascript';
            loaderScript.src = `${baseUrl}/monaco/min/vs/loader.js`;
            loaderScript.addEventListener('load', () => { onGotAmdLoader(); });

            document.body.appendChild(loaderScript);
            // Load AMD loader without over-riding node's require
        }
        else if (!(<any>window).require.config) {
            var src = `${baseUrl}/monaco/min/vs/loader.js`;

            var loaderRequest = new XMLHttpRequest();

            loaderRequest.addEventListener("load", () => {
                let scriptElem = document.createElement('script');
                scriptElem.type = 'text/javascript';
                scriptElem.text = [
                    // Monaco uses a custom amd loader that over-rides node's require.
                    // Keep a reference to node's require so we can restore it after executing the amd loader file.
                    'var nodeRequire = require;',
                    loaderRequest.responseText.replace('"use strict";', ''),
                    // Save Monaco's amd require and restore Node's require
                    'var monacoAmdRequire = require;',
                    'require = nodeRequire;',
                    'require.nodeRequire = require;'
                ].join('\n');
                document.body.appendChild(scriptElem);
                onGotAmdLoader((<any>window).monacoAmdRequire);
            });

            loaderRequest.open("GET", src);
            loaderRequest.send();
        }
        else {
            onGotAmdLoader();
        }
    }

    private loaded() {
        this.ngZone.run(() => this.isLoaded$.next(true));
    }
}


@Component({ template: '' })
export abstract class AbstractMonacoEditor implements AfterViewInit, OnDestroy {
    // instance data

    @ViewChild('editorContainer', { static: true }) editorContainer: ElementRef;

    protected editor: any;
    protected editorOptions: any;
    protected windowResizeSubscription: Subscription;

    // constructor

    constructor(private loader : MonacoEditorLoader) { 
    }

    // public

    getModelMarkers() {
        return monaco.editor.getModelMarkers({
          resource: this.editorOptions.model.uri
        });
    }

    // protected

    protected setupEditor() {
        this.windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => this.layout());
        this.layout();
    }

    protected createEditor() {
        return this.editor = monaco.editor.create(this.editorContainer.nativeElement, this.editorOptions);
    }

    protected getModel() {
        return monaco.editor.getModel(this.editorOptions.model.uri || '');
    }

    protected createModel() {
        return monaco.editor.createModel(this.editorOptions.model.value, this.editorOptions.model.language, this.editorOptions.model.uri);
    }

    // private

    private layout() {
        if ( this.editor )
            this.editor.layout()
    }

    // implement AfterViewInit

    ngAfterViewInit(): void {
        this.loader.isLoaded$.pipe(
            filter(isLoaded => isLoaded),
            take(1)
        ).subscribe(() => { this.setupEditor() })
    }

    // implement OnDestroy

    ngOnDestroy() {
        if (this.windowResizeSubscription)
            this.windowResizeSubscription.unsubscribe();

        if (this.editor) {
            this.editor.dispose();
            this.editor = undefined;
        }
    }
}


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
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MonacoEditorComponent),
        multi: true
    }]
})
export class MonacoEditorComponent extends AbstractMonacoEditor implements ControlValueAccessor {
    // input & ouput

    @Input('options') 
    set options(options: any) {
        this.editorOptions = Object.assign({}, this.config.defaultOptions, options);
    }

    get options(): any {
        return this.editorOptions;
    }

    @Input('model')
    set model(model: EditorModel) {
      this.editorOptions.model = model;
    }

    @Output() onInit: EventEmitter<MonacoEditorComponent> = new EventEmitter();

    // instance data

    private value: string = '';

    onChange = (_: any) => { };
    onTouched = () => { };
    onErrorStatusChange: () => void = () => {};

    errorMessages : string[] = []

    // constructor

    constructor(private zone: NgZone, loader: MonacoEditorLoader, @Inject(MONACO_EDITOR_CONFIG) protected config: MonacoEditorConfig) {
        super(loader)
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
        const hasModel = !!this.editorOptions.model;

        if (hasModel) {
            const model = this.getModel();

            if (model) {
                this.editorOptions.model = model;
                this.editorOptions.model.setValue(this.value);
            } 
            else {
                this.editorOptions.model = this.createModel();
            }
        }

        if (true/*insideNg*/) {
            this.createEditor();
        } 
        else {
            this.zone.runOutsideAngular(() => {
                this.editor = this.createEditor();
            })
        }

        if (!hasModel) {
            this.editor.setValue(this.value);
        }

        super.setupEditor()
    }

    // override

    createEditor() {
        let editor = super.createEditor()

        // add listeners

        editor.onDidChangeModelContent((e: any) => {
            const value = editor.getValue();

            // value is not propagated to parent when executing outside zone.

            this.zone.run(() => {
                this.onChange(value);
                this.value = value;
            });
        });

        editor.onDidBlurEditorWidget(() => {
            this.onTouched();
        });
      
        editor.onDidChangeModelDecorations(() => { if ( !this.model ) return
                const errorMessages = this.getModelMarkers().map(({ message }) => message);

                const hasValidationStatusChanged = this.errorMessages !== errorMessages;
      
                if (hasValidationStatusChanged) {
                    console.log("status change");

                    this.errorMessages = errorMessages;

                    this.onErrorStatusChange();
                }
            });

        
        // trigger listener

        this.onInit.emit(this);

        // done

        return editor
    }

    // implement ControlValueAccessor

    writeValue(value: any): void {
        this.value = value || '';

        // Fix for value change while dispose in process.

        setTimeout(() => {
            if (this.editor && !this.options.model) {
                this.editor.setValue(this.value);
            }
        });
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
}

@NgModule({
    imports: [CommonModule],
    declarations: [MonacoEditorComponent],
    exports: [MonacoEditorComponent]
})
export class MonacoEditorModule {
    public static forRoot(config: MonacoEditorConfig = {}): ModuleWithProviders<MonacoEditorModule> {
        return {
            ngModule: MonacoEditorModule,
            providers: [
                {
                    provide: MONACO_EDITOR_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}