/* eslint-disable @angular-eslint/component-class-suffix */

import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

export interface TabConfig {
    title: string;
    icon: string;
    //template: TemplateRef<any>;
    class: string;
  }

/**
 * @ignore
 */
@Component({ 
  selector: 'tab',
  //standalone: true,
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class LayoutTab implements TabConfig {
    // input

    @Input() id!: string
    @Input() title!: string
    @Input() icon!: string
    @Input() class!: string

    // instacne data

    @ViewChild(TemplateRef, {static: true}) template!: TemplateRef<any>;
}