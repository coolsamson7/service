/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { AbstractExtensionEditor, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';
import { ExtensionEditor } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SvgIconComponent } from '../../svg.icon';
import { PropertyNameComponent } from '../../property-panel/property-name';
import { PropertyListComponent } from './property-list';



@RegisterPropertyEditor("schema:schema")
@Component({
  selector: "schema-editor",
  templateUrl: './schema-editor.html',
  styleUrl: './schema-editor.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyPanelModule, SvgIconComponent, PropertyNameComponent, PropertyListComponent]
})
export class SchemaEditorComponent extends AbstractExtensionEditor {
  // instance data

  open = new Map<Element,boolean> ()
  nameProperty: Moddle.PropertyDescriptor | undefined

  get properties(): Element[] {
    return this.element["properties"];
  }

  // constructor

  constructor(extensionEditor: ExtensionEditor) {
    super()

    extensionEditor.computeLabel = (element: Element) => element["name"] || "<name>"
  }

  isOpen(property: Element) {
    return this.open.get(property)
  }

  add() {
      const newProperty : Element = (<any>this.element)['$model'].create("schema:property")

      newProperty.$parent =  this.element

      this.actionHistory.updateProperties({
        element: this.shape,
        moddleElement: this.element as any as Element,
        properties: {
          properties: [...this.properties, newProperty]
        }
      })

      this.open.set(newProperty, false)
  }

  delete(property: Element) {
    const index = this.properties.indexOf(property)

    const properties = [...this.properties]
    properties.splice(index, 1)

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.element as any as Element,
      properties: {
        properties: properties
      }
    })
  }

  toggle(property: Element) {
    this.open.set(property, !this.isOpen(property))
  }

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      if ( !this.element["properties"] )
        this.element["properties"] = []

      for ( const property of this.properties)
        this.open.set(property, false)

      this.nameProperty = this.element.$descriptor.properties.find((prop) => ["name"].includes(prop.name))
  }
}
