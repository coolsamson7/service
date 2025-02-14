/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, Input } from "@angular/core"
import  { Element } from "moddle"
import { Group, PropertyGroupComponent } from "./property-group"
import { PropertyEditorDirective } from "./property.editor.directive"
import { CommonModule } from "@angular/common"


@Component({
  selector: 'extension-editor',
  templateUrl: './extension-editor.html',
  styleUrl: "./extension-editor.scss"
  //standalone: true,
  //imports: [CommonModule, PropertyEditorDirective]
})
export class ExtensionEditor implements OnInit {
  // input

  @Input() element: Element
  @Input() extension: string
  @Input() config: Group

  extensionElement : Element

  extensions : Element[] = []
  open : boolean[] = []

  // constructor

  constructor(private group: PropertyGroupComponent) {
     group.plus = () => this.add()
  }

  // callbacks

  toggle(extension: number) {
    this.open[extension] = !this.open[extension]
  }

  delete(extension: Element) {
    const values = this.extensionElement.get('values')
    const index = this.extensionElement.get('values').indexOf(extension)

    values.splice(index, 1);

    this.extensions = this.getExtensionElements(this.extension)

    this.group.children--
  }

  // private

  add() {
    const newExtension = this.element.$model.create(this.extension)

    this.extensionElement.get('values').push(newExtension);
    this.extensions.push(newExtension)

    newExtension.$parent = this.extensionElement

    this.open.push(false)

    this.group.children++// = this.getExtensionElements().get('values').length
  }


  protected getExtensionElements(type) : Element[] {
    if ( this.element.extensionElements.values)
      return this.element.extensionElements.values.filter((extensionElement) => extensionElement.$instanceOf(type));
    else
      return []
  }

  // implement OnInit

  ngOnInit(): void {
    const extensionElement = this.element.extensionElements || this.element.$model.create('bpmn:ExtensionElements');

    if ( extensionElement.$parent == undefined) {
      this.element.extensionElements = extensionElement
      extensionElement.$parent = this.element
    }

    this.extensionElement = extensionElement

    this.extensions = this.getExtensionElements(this.extension)

    this.open = this.extensions.map((ext) => true)

    setTimeout(() => { this.group.children = this.extensions.length}, 0)

  }
}
