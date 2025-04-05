/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { AbstractExtensionEditor, EditorSettings, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';
import { ExtensionEditor } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DataTypes } from '../../util/data-types';
import { PropertyNameComponent } from '../../property-panel/property-name';


@RegisterPropertyEditor("schema:property")
@Component({
  selector: "property-editor",
  templateUrl: './property-editor.html',
  styleUrl: './property-editor.scss',
  standalone: true,
  imports: [
    // angular

    FormsModule,
    CommonModule, 
     
     // material
     
     MatFormFieldModule, 
     MatSelectModule, 
    
     // own stuff
     
     PropertyPanelModule, 
     PropertyNameComponent
    ],
  encapsulation: ViewEncapsulation.None
})
export class SchemaPropertyEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  name!: Moddle.PropertyDescriptor
  type!: Moddle.PropertyDescriptor
  constraint!: Moddle.PropertyDescriptor
  value!: Moddle.PropertyDescriptor

  types = DataTypes.types

  typedProperty!: Moddle.PropertyDescriptor
  typesProperty!: Moddle.PropertyDescriptor

  typeHints: EditorSettings<string> = {
    oneOf: DataTypes.types
  }

  // constructor

  constructor(extensionEditor: ExtensionEditor) {
    super()

    extensionEditor.computeLabel = (element: Element) => element.get("name") || "<name>"
  }

  typeChange(event: any) {
    this.typedProperty = this.createProperty("value", this.element["type"] || "String")
  }

  override onChange(event: any) {
    console.log(event)
  }

  createProperty(name: string, type: string) : Moddle.PropertyDescriptor {
    return {
      name: name,
      type: type,
      ns: {
        localName: name,
        name: name,
        prefix: name
      }
    }
  }


  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.name =  this.element.$descriptor.properties.find((prop) => prop.name === "name")!
      this.type =  this.element.$descriptor.properties.find((prop) => prop.name === "type")!
      this.constraint =  this.element.$descriptor.properties.find((prop) => prop.name === "constraint")!
      this.value =  this.element.$descriptor.properties.find((prop) => prop.name === "value")!

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type", "constraint", "value"].includes(prop.name))

      this.typeChange("")
  }
}
