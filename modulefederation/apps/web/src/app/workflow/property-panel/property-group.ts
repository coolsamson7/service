import { Component, Directive, Input } from "@angular/core"
import  {Element } from "moddle"
import { Group } from "./property-panel.model";
import { BaseElement } from "bpmn-moddle";

export type Plus = () => void

@Component( {
  selector: 'property-group',
  templateUrl: "./property-group.html",
  styleUrl: "./property-group.scss",
  //standalone: true,
  //imports: [CommonModule, SvgIconComponent, ExtensionEditor, PropertyEditorDirective]
})
export class PropertyGroupComponent {
  // input

  @Input() element : Element | undefined;
  @Input() group!: Group

  // instance data

  children = -1 // set by the corresponding extension editor
  open = true
  plus? : Plus = undefined


  // public

  toggle() {
    this.open = !this.open
  }
}
