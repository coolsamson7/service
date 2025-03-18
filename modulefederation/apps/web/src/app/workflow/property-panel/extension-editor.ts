/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, Input } from "@angular/core"
import { Element } from "moddle"
import { PropertyGroupComponent } from "./property-group"
import { BaseElement, ExtensionElements } from "bpmn-moddle"
import { Group } from "./property-panel.model"
import { Shape } from "bpmn-js/lib/model/Types";

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

  extensions : Element[] = []
  open : boolean[] = []

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
    const values : any[] = this.extensionElement.values
    const index = values.indexOf(extension)

    values.splice(index, 1);

    this.extensions = this.getExtensionElements(this.extension)

    this.group.children--
  }

  // private

  add() { 
    const newExtension : BaseElement = (<any>this.element)['$model'].create(this.extension)

    if (!this.extensionElement.values)
      this.extensionElement.values = []

    this.extensionElement.values.push(newExtension);
    this.extensions.push(<Element><any>newExtension)

    newExtension.$parent = this.extensionElement

    this.open.push(false)

    this.group.children++// = this.getExtensionElements().get('values').length
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

    this.extensions = this.getExtensionElements(this.extension)

    this.open = this.extensions.map((ext) => true)

    // avoid angualr digest error
    
    setTimeout(() => { this.group.children = this.extensions.length}, 0)
  }
}
