/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input } from "@angular/core"
import { Element } from "moddle"
import { PropertyGroupComponent } from "./property-group"
import { Shape } from "bpmn-js/lib/model/Types";
import { ExtensionEditor } from "./extension-editor"
import { Group } from "./property-panel.model";
import { Context } from "./property.editor.directive";

@Component({
  selector: 'extension-list',
  templateUrl: './extension-list.html',
  styleUrl: "./extension-list.scss"
})
export class ExtensionList {
  // input

  @Input() extensions! : Element[]
  @Input() context!: Context
  //@Input() shape!: Shape
  //@Input() group!: PropertyGroupComponent
  @Input() config!: Group

  // constructor

  constructor(public extensionEditor: ExtensionEditor) {
  }
}
