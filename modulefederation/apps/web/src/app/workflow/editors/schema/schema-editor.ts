/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { AbstractExtensionEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';
import { ExtensionEditor } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SvgIconComponent } from '../../svg.icon';
import { DataTypes } from '../../util/data-types';
import { ModelValidationDirective } from '../../validation';



@RegisterPropertyEditor("schema:schema")
@Component({
  selector: "schema-editor",
  templateUrl: './schema-editor.html',
  styleUrl: './schema-editor.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyEditorModule, SvgIconComponent, ModelValidationDirective]
})
export class SchemaEditor extends AbstractExtensionEditor {
  // instance data

  open : boolean[] = []
  nameProperty: Moddle.PropertyDescriptor | undefined

  get properties(): Element[] {
    return this.element["properties"];
  }

  // constructor

  constructor(extensionEditor: ExtensionEditor) {
    super()

    extensionEditor.computeLabel = (element: Element) => element["name"] || "<name>"
  }

  add() {
      const newProperty : Element = (<any>this.element)['$model'].create("schema:property")

      newProperty.$parent =  this.element


      this.element["properties"].push(newProperty)
      this.open.push(false)
  }

  name(property: Element) {
    if ( property["name"] && property["name"].trim().length > 0)
      return property["name"] + " : " +  property["type"]
    else
      return "<name>" + " : " + property["type"]
  }

  delete(property: Element) { // TODO
    /*const values : any[] = this.extensionElement.values
    const index = values.indexOf(extension)

    values.splice(index, 1);

    this.extensions = this.getExtensionElements(this.extension)
*/
  }

  toggle(extension: number) {
    this.open[extension] = !this.open[extension]
  }


  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      if ( !this.element["properties"] )
        this.element["properties"] = []

      this.nameProperty = this.element.$descriptor.properties.find((prop) => ["name"].includes(prop.name))
  }
}


@RegisterPropertyEditor("schema:property")
@Component({
  selector: "property-editor",
  templateUrl: './property-editor.html',
  styleUrl: './schema-editor.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyEditorModule]
})
export class SchemaPropertyEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []
  types = DataTypes.types

  typedProperty!: Moddle.PropertyDescriptor 

  // constructor

  constructor(extensionEditor: ExtensionEditor) {
    super()

    extensionEditor.computeLabel = (element: Element) => element.get("name") || "<name>"
  }

  // 

  typeChange(event: any) {
    this.typedProperty = this.createProperty(this.element["type"])

    this.convertType()
  }

  override onChange(event: any) {
    console.log(event)
  }

  convertType() {
    let value  = this.element["value"]

    if ( this.element["type"] == "Boolean")
      value = value == "true"
    else if ( ["Integer", "Short", "Long"].includes(this.element["type"])) {
      value = parseInt(value)
    }
    else if ( ["Double"].includes(this.element["type"]))
      value = parseFloat(value)

    this.element["value"] = value
  }

  createProperty(type: string) : Moddle.PropertyDescriptor {
    return {
      name: "value",
      type: type,
      ns: {
        localName: "value",
        name: "schema:value",
        prefix: "value"
      }
    }
  }

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type", "value"].includes(prop.name))

      const valueProperty =  this.properties[2]

      // convert the string value to the correct typescritp type

      this.convertType()

      this.typedProperty = this.createProperty(this.element["type"] || "String")
  }
}
