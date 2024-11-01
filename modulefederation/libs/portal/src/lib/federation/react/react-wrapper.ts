import { Component, AfterContentInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { loadRemoteModule } from "@nx/angular/mf";

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ActivatedRoute } from "@angular/router";
import { Root } from 'react-dom/client';

export type ReactWrapperOptions =  {
  module: string
};

@Component({
  selector: 'react-component-wrapper',
  template: '<div #container></div>'
})
export class ReactComponentWrapper implements AfterContentInit, OnDestroy {
  // instance data

  @ViewChild('container', { static: true }) container!: ElementRef;

  options! : ReactWrapperOptions
  root!: Root

  // constructor

  constructor(private route: ActivatedRoute) {}

   // implement AfterContentInit

   async ngAfterContentInit() {
      this.options = this.route.snapshot.data as ReactWrapperOptions

      const module = await loadRemoteModule(this.options.module, "./Module");

      const component = module.default; // Assuming default export
      const reactElement = React.createElement(component); // args?

    

      this.root = ReactDOM.createRoot(this.container.nativeElement);

      console.log(component)
      console.log(reactElement)
      console.log(this.root)

      this.root.render(reactElement); // Render using 'createRoot'
  }

   // implement OnDestroy

   ngOnDestroy(): void {
    console.log(this.root)
    this.root?.unmount()
  }
}
