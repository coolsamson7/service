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
  elementName: string;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'wc-wrapper',
  template: '<div #vc></div>',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WebComponentWrapper implements AfterContentInit, OnChanges {
  // input

  @Input() options: WebComponentWrapperOptions | null = null;
  @Input() props: { [prop: string]: unknown } = {};
  @Input() events: { [event: string]: (event: Event) => void } = {};

  // instance data

  @ViewChild('vc', { read: ElementRef, static: true })
  vc!: ElementRef;
  element!: HTMLElement;

  // constructor

  constructor(private route: ActivatedRoute) {}

  // implement OnChanges

  ngOnChanges(): void {
    console.log("jjj")
    if (this.element)
      this.populateProps();
  }

  // implement AfterContentInit

  async ngAfterContentInit() {
    const options = this.options ?? (this.route.snapshot.data as WebComponentWrapperOptions);

    try { // TODO
      setRemoteDefinitions({
        "foo": "http://localhost:4205/remoteEntry.js"
      })
      await loadRemoteModule("foo", "./Module"); // TODO

      this.element = document.createElement("react-element")//options.elementName);
      this.populateProps();
      this.setupEvents();

      this.vc.nativeElement.appendChild(this.element);
    }
    catch (error) {
      console.error(error);
    }
  }

  // private

  private populateProps() {
    for (const prop in this.props)
      (this.element as any)[prop] = this.props[prop];
  }

  private setupEvents() {
    for (const event in this.events)
      this.element.addEventListener(event, this.events[event]);
  }
}
