/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { AbstractExtensionEditor, EditorHints, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';
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
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyPanelModule, PropertyNameComponent]
})
export class SchemaPropertyEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []
  types = DataTypes.types

  typedProperty!: Moddle.PropertyDescriptor
  typesProperty!: Moddle.PropertyDescriptor

  typeHints: EditorHints<string> = {
    oneOf: DataTypes.types
  }

  // constructor

  constructor(extensionEditor: ExtensionEditor) {
    super()

    extensionEditor.computeLabel = (element: Element) => element.get("name") || "<name>"
  }

  //

  typeChange(event: any) {
    this.typedProperty = this.createProperty("value", this.element["type"])

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

    if ( this.element["value"] !== value) {
      this.element["value"] = value // TODO: undo
    }
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

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type", "value"].includes(prop.name))

      const valueProperty =  this.properties[2]

      // convert the string value to the correct typescritp type

      this.convertType()

      this.typedProperty = this.createProperty("value", this.element["type"] || "String")
  }
}
