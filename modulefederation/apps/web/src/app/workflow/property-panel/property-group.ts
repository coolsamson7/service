import { Component, Input, OnInit } from "@angular/core"
import {Element, PropertyDescriptor } from "moddle"
import { Group } from "./property-panel.model";

import { Shape } from "bpmn-js/lib/model/Types";
import { PropertyPanelComponent } from "./property-panel";
import { Context, PropertyEditorDirective } from "./property.editor.directive";

export type Plus = () => void

@Component( {
  selector: 'property-group',
  templateUrl: "./property-group.html",
  styleUrl: "./property-group.scss"
})
export class PropertyGroupComponent implements OnInit {
  // input

  @Input() shape : Shape | undefined;
  @Input() element : Element | undefined;
  @Input() group!: Group

  // instance data

  context!: Context
  
   editors: PropertyEditorDirective[] = []

  // constructor

  constructor(public panel: PropertyPanelComponent) {
    panel.addGroup(this)
  }

  // instance data

  children = -1 // set by the corresponding extension editor
  open = true
  plus? : Plus = undefined


  // public

  inputs(property: string) : any {
    return { value: this.element!.get(property) }
  }


  toggle() {
    this.open = !this.open
  }

  // implement OnInit

  ngOnInit(): void {
    this.context = {
      shape: this.shape!,
      group: this
    }
  }
}
