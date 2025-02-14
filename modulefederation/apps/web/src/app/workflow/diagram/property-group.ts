import { Component, Input, OnInit } from "@angular/core"
import  {Element, Descriptor, Moddle, PropertyDescriptor  } from "moddle"
import { SvgIconComponent } from '../svg.icon';
import { ExtensionEditor } from "./extension-editor";
import { CommonModule } from "@angular/common";
import { PropertyEditorDirective } from "./property.editor.directive";

export interface GroupConfig {
  name: string,
  element?: string,
  extension?: string,
  multiple?: boolean,
  properties: string[]
}

export interface PropertyPanelConfig {
  groups: GroupConfig[]
}

export interface Group {
  name: string,
  element?: string,
  extension?: string,
  multiple?: boolean,
  properties: PropertyDescriptor[]
}

export interface PropertyPanel {
  groups: Group[]
}

export type Plus = () => void


@Component( {
  selector: 'property-group',
  templateUrl: "./property-group.html",
  styleUrl: "./property-group.scss",
  //standalone: true,
  //imports: [CommonModule, SvgIconComponent, ExtensionEditor, PropertyEditorDirective]
})
export class PropertyGroupComponent implements OnInit {
  // input

  @Input() element : Element | undefined;
  @Input() group : Group

  // instance data

  children = -1 // set by  th eextension editor
  open = true
  plus? : Plus = undefined


  // public

  toggle() {
    this.open = !this.open
  }

  // implement OnInit

  ngOnInit(): void {
    console.log(this.group.name)
  }
}
