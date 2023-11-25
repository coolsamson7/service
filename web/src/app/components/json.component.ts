import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, OnDestroy, Inject, ElementRef, NgModule, ModuleWithProviders, NgZone, forwardRef } from "@angular/core";
import { v4 as uuidv4 } from 'uuid';
import { InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { InterfaceDescriptor } from "../model/service.interface";
import { Subscription, fromEvent } from 'rxjs';

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


@Component({ template: '' })
export abstract class AbstractMonacoEditor implements AfterViewInit, OnDestroy {
    // static data

    static loadedMonaco = false;
    static loadPromise: Promise<void>;

    // input & output

    @Input('insideNg')
    set insideNg(insideNg: boolean) {
        this.isInsideNg = insideNg;

        if (this.editor) {
            this.editor.dispose();
            this.initMonaco(this.editorOptions, this.insideNg);
        }
    }

    get insideNg(): boolean {
        return this.isInsideNg;
    }

    @Output() onInit = new EventEmitter<any>();

    // instance data

    @ViewChild('editorContainer', { static: true }) editorContainer: ElementRef;

    protected editor: any;
    protected editorOptions: any;
    protected windowResizeSubscription: Subscription;
    private isInsideNg: boolean = false;

    // constructor

    constructor(@Inject(MONACO_EDITOR_CONFIG) protected config: MonacoEditorConfig) { }

    // abstract

    protected abstract initMonaco(options: any, insideNg: boolean): void;

    // implement AfterViewInit

    ngAfterViewInit(): void {
        if (AbstractMonacoEditor.loadedMonaco) {
            // Wait until monaco editor is available

            AbstractMonacoEditor.loadPromise.then(() => {
                this.initMonaco(this.editorOptions, this.insideNg);
            });
        }
        else {
            AbstractMonacoEditor.loadedMonaco = true;
            AbstractMonacoEditor.loadPromise = new Promise<void>((resolve: any) => {
                const baseUrl = this.config.baseUrl || "./assets";

                if (typeof ((<any>window).monaco) === 'object') {
                    this.initMonaco(this.editorOptions, this.insideNg);
                    resolve();
                    return;
                }

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

                        this.initMonaco(this.editorOptions, this.insideNg);

                        resolve();
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
            });
        }
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
    // input

    @Input('options')
    set options(options: any) {
        this.editorOptions = Object.assign({}, this.config.defaultOptions, options);
        if (this.editor) {
            this.editor.dispose();
            this.initMonaco(options, this.insideNg);
        }
    }

    get options(): any {
        return this.editorOptions;
    }

    @Input('model')
    set model(model: EditorModel) {
        this.options.model = model;
        if (this.editor) {
            this.editor.dispose();
            this.initMonaco(this.options, this.insideNg);
        }
    }

    // instance data

    private value: string = '';

    onChange = (_: any) => { };
    onTouched = () => { };

    // constructor

    constructor(private zone: NgZone, @Inject(MONACO_EDITOR_CONFIG) private editorConfig: MonacoEditorConfig) {
        super(editorConfig);
    }

    // protected

    protected initMonaco(options: any, insideNg: boolean): void {
        const hasModel = !!options.model;

        if (hasModel) {
            const model = monaco.editor.getModel(options.model.uri || '');

            if (model) {
                options.model = model;
                options.model.setValue(this.value);
            } 
            else {
                options.model = monaco.editor.createModel(options.model.value, options.model.language, options.model.uri);
            }
        }

        if (insideNg) {
            this.editor = monaco.editor.create(this.editorContainer.nativeElement, options);
        } 
        else {
            this.zone.runOutsideAngular(() => {
                this.editor = monaco.editor.create(this.editorContainer.nativeElement, options);
            })
        }

        if (!hasModel) {
            this.editor.setValue(this.value);
        }

        this.editor.onDidChangeModelContent((e: any) => {
            const value = this.editor.getValue();

            // value is not propagated to parent when executing outside zone.

            this.zone.run(() => {
                this.onChange(value);
                this.value = value;
            });
        });

        this.editor.onDidBlurEditorWidget(() => {
            this.onTouched();
        });

        // refresh layout on resize event.

        if (this.windowResizeSubscription)
            this.windowResizeSubscription.unsubscribe();
        
        this.windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => this.editor.layout());

        // done

        this.onInit.emit(this.editor);
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