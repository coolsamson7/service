/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Injectable, Injector, NgModule, Type } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { PropertyEditor } from './property-editor';
import { RegisterPropertyEditor } from './property-editor.decorator';
import { AbstractPropertyEditor } from './abstract-property-editor';
import { FormsModule } from '@angular/forms';
import { AbstractExtensionEditor } from './abstract-extension-editor';

// the registry

@Injectable({providedIn: "root"})
export class PropertyEditorRegistry {
  // instance data

  registry: {[type: string] : Type<PropertyEditor>} = {}

  // public

  register(type: string, component: Type<PropertyEditor>) {
    console.log("### register " + type)
    this.registry[type] = component
  }

  get(type: string) : Type<PropertyEditor> {
    console.log("### fetch " + type)
    const result = this.registry[type]

    return result
    /*if ( result )
      return result
    else
      throw new Error("no registered type " + type)*/
  }
}

// some test editors

import { PropertyEditorDirective } from './property.editor.directive';
import { CommonModule } from '@angular/common';

//import  { StringPropertyEditorModule } from "./editor/string-editor"
//import  { ExecutionListenerEditorModule } from "./editor/execution-listener"


// the module

const MODULES = [
  // common

  CommonModule,
  FormsModule,

  // editors

  //StringPropertyEditorModule,
  //ExecutionListenerEditorModule
]

@NgModule({
  imports: MODULES,
  //declarations: [PropertyEditorDirective],
  exports: [...MODULES]//, PropertyEditorDirective]
})
export class PropertyEditorModule {
  static injector = new ReplaySubject<Injector>()

  constructor(injector: Injector) {
    PropertyEditorModule.injector.next(injector);
  }
}



