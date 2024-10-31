import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { loadRemoteModule, setRemoteDefinitions } from '@nx/angular/mf';

export type WebComponentWrapperOptions =  {
  module: string,
  elementName: string;
};

@Component({
  selector: 'web-component-wrapper',
  template: '<div #vc></div>',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WebComponentWrapper implements AfterContentInit {
  // input

  options: WebComponentWrapperOptions | null = null;

  // instance data

  @ViewChild('vc', { read: ElementRef, static: true })
  vc!: ElementRef;
  element!: HTMLElement;

  // constructor

  constructor(private route: ActivatedRoute) {}

  // implement AfterContentInit

  async ngAfterContentInit() {
     this.options = this.route.snapshot.data as WebComponentWrapperOptions

    try {
      await loadRemoteModule(this.options.module, "./Module");

      this.element = document.createElement(this.options.elementName);

      this.vc.nativeElement.appendChild(this.element);
    }
    catch (error) {
      console.error(error);
    }
  }
}
