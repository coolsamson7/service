/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, Input } from "@angular/core"
import { Element } from "moddle"
import { PropertyGroupComponent } from "./property-group"
import { BaseElement, ExtensionElements } from "bpmn-moddle"
import { Group } from "./property-panel.model"
import { Shape } from "bpmn-js/lib/model/Types";
import { ActionHistory, CommandBuilder } from "../bpmn"

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

  // instance data

  open = new Map<Element,boolean> ()

  get actionHistory() : ActionHistory {
    return this.group.panel.actionHistory
  }

  get extensionElements() : Element | undefined {
    return this.get<Element>('extensionElements')
  }

  get extensions() : Element[] {
    const extensionElements = this.extensionElements
    if ( extensionElements )
      return (extensionElements["values"] || []).filter((extensionElement: any) => extensionElement.$instanceOf(this.extension)) as unknown as Element[]
    else
      return [] 
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
    const values : any[] = [...this.extensionElements!["values"]]
    const index = values.indexOf(extension)

    values.splice(index, 1);

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.extensionElements,
      properties: {
        values: values
      }
    })

    this.group.children--
  }

  // private

  create<T extends Element>(type: string, properties: any) : T {
    const element = this.element['$model'].create(type)

    for ( const property in properties)
      element[property] = properties[property]

    return element
  }

  add() {
    const builder = this.actionHistory.commandBuilder()

    // check extensionElements

    let extensionElements = this.extensionElements

   
    if ( !extensionElements) {
      extensionElements = this.create<Element>('bpmn:ExtensionElements', {
        $parent: this.element,
        values: []
        } );

        builder
            .updateProperties({
              element: this.shape,
              moddleElement: this.element,
              properties: {
                extensionElements: extensionElements
              }
            });
      }
   
    if (!extensionElements["values"])
     extensionElements["values"] = []

    // create new element

    const newExtension = this.create(this.extension, {$parent: this.element})

    builder.updateProperties({
      element: this.shape,
      moddleElement: extensionElements,
      properties: {
        values: [...extensionElements!["values"], newExtension]
      }
    })

    // execute

    builder.execute()

    // update open

    this.open.set(newExtension, false)

    this.group.children++
  }

  // implement OnInit

  ngOnInit(): void {
    for ( const extension of this.extensions)
          this.open.set(extension, false)

    // avoid angular digest error

    setTimeout(() => { this.group.children = this.extensions.length}, 0)
  } 
}
