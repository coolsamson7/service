/* eslint-disable @angular-eslint/component-class-suffix */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild,  NgZone } from "@angular/core";
import { filter, fromEvent, Subscription, take } from "rxjs";
import { EditorModel } from "./monaco-editor";
import { MonacoEditorLoader } from "./monaco-editor-loader";
import { ResizeObservable } from "../ui/resize-observable";

declare let monaco : any;

@Component({template: ''})
export abstract class AbstractMonacoEditor implements AfterViewInit, OnDestroy {
    // instance data

    @ViewChild('editorContainer', {static: true}) editorContainer! : ElementRef;

    protected editor : any;
    protected model! : EditorModel;
    protected editorOptions : any;
    protected resizeSubscription! : Subscription;
    protected modelInstance : any
    protected uri : any
    protected value = ""

    // constructor

    constructor(private loader : MonacoEditorLoader, private el: ElementRef, protected zone: NgZone) {
    }

    // public

    getModelMarkers() {
        return monaco.editor.getModelMarkers({
            resource: this.uri
        });
    }

    private onResize(resize: ResizeObserverEntry) {
        this.layout()
    }

    // protected

    ngAfterViewInit() : void {
        this.loader.isLoaded$.pipe(
            filter(isLoaded => isLoaded),
            take(1)
        ).subscribe(() => {
            setTimeout(() => this.setupEditor(), 0)
        })

        this.resizeSubscription = new ResizeObservable(this.el.nativeElement.childNodes[0], this.zone)
        //TODO .pipe(debounceTime(200))
        .subscribe((entries: ResizeObserverEntry[]) => this.onResize(entries[0]));
    }

    ngOnDestroy() {
        if (this.resizeSubscription) this.resizeSubscription.unsubscribe();

        if (this.editor) {
            this.editor.getModel()?.dispose()
            this.editor.dispose();
            this.editor = undefined;
        }
    }

    protected setupEditor() {
        if (this.model.schema)
            this.setSchema()

        this.layout();
    }

    protected createEditor() {
        return this.editor = monaco.editor.create(this.editorContainer.nativeElement, this.editorOptions);
    }

    protected getModel() {
        return monaco.editor.getModel(this.uri || '');
    }

    // private

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

    // implement AfterViewInit

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

    // implement OnDestroy

    private layout() {
        if (this.editor)
            this.editor.layout()
    }
}


