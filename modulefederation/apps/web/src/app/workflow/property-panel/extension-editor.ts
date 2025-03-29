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

  extensionElement! : ExtensionElements

  open = new Map<Element,boolean> ()

  get actionHistory() : ActionHistory {
    return this.group.panel.actionHistory
  }

  get extensions() : Element[] {
    return this.element["extensionElements"].values.filter((extensionElement: any) => extensionElement.$instanceOf(this.extension));
  }

  get<T>(property: string) : T {
    return this.element[property] as T
  }

  set<T>(property: string, value: T) : void {
     this.element[property] = value
  }

  computeLabel = (element: Element) => {return element.$type}

  // constructor

  constructor(public group: PropertyGroupComponent) {
     group.plus = () => this.add()
  }

  // callbacks

  isOpen(extension: Element) {
    return this.open.get(extension)
  }

  toggle(extension: Element) {
    this.open.set(extension, !this.isOpen(extension))
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

  create(type: string, properties: any) : Element {
    const element = this.element['$model'].create(type)

    for ( const property in properties)
      element[property] = properties[property]

    return element
  }

  add() {
    const newExtension = this.create(this.extension, {$parent: this.element})

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.extensionElement as any as Element,
      properties: {
        values: [...this.extensionElement.values, newExtension]
      }
    })

     this.open.set(newExtension, false)

    this.group.children++
  }

  // implement OnInit

  ngOnInit(): void {
    let extensionElement = this.element["extensionElements"]

     if ( !extensionElement) {
       this.set("extensionElements", extensionElement = this.create('bpmn:ExtensionElements', {
         $parent: this.element,
         values: []
         } ));

         (<any>extensionElement)["$builder"] = this.actionHistory.commandBuilder()
             .updateProperties({
               element: this.shape,
               moddleElement: this.element,
               properties: {
                 extensionElements: extensionElement
               },
               oldProperties: {
                 extensionElements: undefined
               }
             });
       }
    else if (!this.extensionElement.values)
      this.extensionElement.values = []

    for ( const extension of this.extensions)
          this.open.set(extension, false)

    // avoid angular digest error

    setTimeout(() => { this.group.children = this.extensions.length}, 0)
  }
}
