import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { Subscription, fromEvent, filter, take } from "rxjs";
import { EditorModel } from "./monaco-editor";
import { MonacoEditorLoader } from "./monaco-editor-loader";

declare var monaco: any;

@Component({ template: '' })
export abstract class AbstractMonacoEditor implements AfterViewInit, OnDestroy {
    // instance data

    @ViewChild('editorContainer', { static: true }) editorContainer: ElementRef;

    protected editor: any;
    protected model: EditorModel;
    protected editorOptions: any;
    protected windowResizeSubscription: Subscription;
    protected modelInstance
    protected uri
    protected value = ""

    // constructor

    constructor(private loader : MonacoEditorLoader) { 
    }

    // public

    getModelMarkers() {
        return monaco.editor.getModelMarkers({
          resource: this.uri
        });
    }

    // protected

    protected setupEditor() {
        if ( this.model.schema)
            this.setSchema()

        this.windowResizeSubscription = fromEvent(window, 'resize')
            .subscribe(() => this.layout());

        this.layout();
    }

    protected createEditor() {
        return this.editor = monaco.editor.create(this.editorContainer.nativeElement, this.editorOptions);
    }

    protected getModel() {
        return monaco.editor.getModel(this.uri || '');
    }

    protected createModel() {
        let model = this.getModel();
        if (!model) {
            model = monaco.editor.createModel(
                this.value, 
                this.model.language,
                this.uri);
        }
    
        this.editorOptions.model = model

        return this.modelInstance = model
    }

    protected setSchema() {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: this.uri,
                fileMatch: [this.uri.toString()],
                schema: this.model.schema
            }]
        })
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
        ).subscribe(() => { setTimeout(() => this.setupEditor() , 0)})
    }

    // implement OnDestroy

    ngOnDestroy() {
        if (this.windowResizeSubscription)
            this.windowResizeSubscription.unsubscribe();

        if (this.editor) {
            this.editor.getModel()?.dispose()
            this.editor.dispose();
            this.editor = undefined;
        }
    }
}


