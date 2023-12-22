import { InjectionToken } from "@angular/core";

export interface EditorModel {
  value : string;
  language? : string;
  schema : any
  uri? : any;
}


export const MONACO_EDITOR_CONFIG = new InjectionToken('MONACO_EDITOR_CONFIG');

export interface MonacoEditorConfig {
  baseUrl? : string;
  requireConfig? : { [key : string] : any; };
  defaultOptions? : { [key : string] : any; };
  monacoRequire? : Function;
  onMonacoLoad? : Function;
}
