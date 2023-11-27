import { Injectable, NgZone, Inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { MONACO_EDITOR_CONFIG, MonacoEditorConfig } from "./monaco-editor";

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
