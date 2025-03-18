import { Component, Input } from "@angular/core"
import {Element, PropertyDescriptor } from "moddle"
import { Group } from "./property-panel.model";

import { Shape } from "bpmn-js/lib/model/Types";
import { PropertyPanelComponent } from "./property-panel";
import { PropertyEditorDirective } from "./editor";

export type Plus = () => void

@Component( {
  selector: 'property-group',
  templateUrl: "./property-group.html",
  styleUrl: "./property-group.scss"
})
export class PropertyGroupComponent {
  // input

  @Input() shape : Shape | undefined;
  @Input() element : Element | undefined;
  @Input() group!: Group

  // instance data

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

  valueOf(element: Element, property: PropertyDescriptor) {
    return element.get(property.name)
  }

  toggle() {
    this.open = !this.open
  }
}
