/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, Input } from "@angular/core"
import { Element } from "moddle"
import { PropertyGroupComponent } from "./property-group"
import { BaseElement, ExtensionElements } from "bpmn-moddle"
import { Group } from "./property-panel.model"
import { Shape } from "bpmn-js/lib/model/Types";
import { ActionHistory } from "../bpmn"

@Component({
  selector: 'extension-editor', 
  templateUrl: './extension-editor.html',
  styleUrl: "./extension-editor.scss"
})
export class ExtensionEditor implements OnInit {  
  // input

  @Input() element!: Element
  @Input() shape!: Shape
  @Input() extension!: string
  @Input() config!: Group
  //@Input() group!: PropertyGroupComponent

  extensionElement! : ExtensionElements

  open : boolean[] = []

  get actionHistory() : ActionHistory {
    return this.group.panel.actionHistory
  }

  get extensions() : Element[] {
    return this.element["extensionElements"].values.filter((extensionElement: any) => extensionElement.$instanceOf(this.extension));
  }

  computeLabel = (element: Element) => {return element.$type}

  // constructor

  constructor(public group: PropertyGroupComponent) {
     group.plus = () => this.add()
  }

  // callbacks

  toggle(extension: number) {
    this.open[extension] = !this.open[extension]
  }

  delete(extension: Element) {
    const values : any[] = [...this.extensionElement.values]
    const index = values.indexOf(extension)

    values.splice(index, 1);

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.extensionElement as any as Element,
      properties: {
        values: values
      }
    })

    this.group.children--
  }

  // private

  create(extension: string) : Element {
    const newExtension : BaseElement = (<any>this.element)['$model'].create(extension)

    newExtension.$parent = this.extensionElement

    return newExtension as any as Element
  }

  add() { 
    const newExtension = this.create(this.extension)

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.extensionElement as any as Element,
      properties: {
        values: [...this.extensionElement.values, newExtension]
      }
    })

    this.open.push(false)

    this.group.children++
  }

  protected getExtensionElements(type: string) : Element[] {
    if ( this.element["extensionElements"]?.values)
      return this.element["extensionElements"].values.filter((extensionElement: any) => extensionElement.$instanceOf(type));
    else
      return []
  }

  // implement OnInit

  ngOnInit(): void {
    const extensionElement = this.element["extensionElements"] || (<any>this.element)['$model'].create('bpmn:ExtensionElements');

    if ( extensionElement.$parent == undefined) {
      (this.element)["extensionElements"] = extensionElement

      extensionElement.$parent = this.element
    }

    this.extensionElement = extensionElement

    if (!this.extensionElement.values)
      this.extensionElement.values = []

    this.open = this.extensions.map((ext) => true)

    // avoid angular digest error
    
    setTimeout(() => { this.group.children = this.extensions.length}, 0)
  }
}
