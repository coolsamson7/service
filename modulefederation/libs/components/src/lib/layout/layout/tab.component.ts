/* eslint-disable @angular-eslint/component-class-suffix */

import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { State, Stateful } from "@modulefederation/common";

export type TabState = "docked" | "floating"

export interface Tab {
    title: string;
    icon: string;
    template: TemplateRef<any>;
    class: string;
    state: TabState
  }

@Stateful()
@Component({ 
  selector: 'tab',
  //standalone: true,
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class TabComponent implements Tab {
    // input

    @Input() id!: string
    @Input() title!: string
    @Input() icon!: string
    @Input() class!: string

    // instance data

    @ViewChild(TemplateRef, {static: true}) template!: TemplateRef<any>;

    @State()
    state : TabState = "docked"
    @State()
    dockSize : any = undefined
    @State()
    floatSize: any = undefined
    dialogRef: any = undefined;
    
    @State()
    opened = false

    // public

    isDocked() {
        return this.opened && this.state == "docked"
    }

    isFloating() {
        return this.opened && this.state == "floating"
    }

    isOpen() {
        return this.opened
    }

    toggle() {
        this.opened = !this.opened
    }

    open(state : TabState = "docked") {
        this.state = state
        this.opened = true
    }

    close(state : TabState = "docked") {
        this.state = state
        this.opened = false
    }
}