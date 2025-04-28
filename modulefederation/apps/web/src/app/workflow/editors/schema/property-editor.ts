/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { AbstractExtensionEditor, AbstractPropertyEditor, EditorSettings, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';
import { ExtensionEditor } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DataTypes } from '../../util/data-types';
import { PropertyNameComponent } from '../../property-panel/property-name';
import { ArraySuggestionProvider, SuggestionProvider } from '@modulefederation/portal';


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

  isInput = false

  name!: Moddle.PropertyDescriptor
  type!: Moddle.PropertyDescriptor
  source!: Moddle.PropertyDescriptor
  constraint!: Moddle.PropertyDescriptor
  value!: Moddle.PropertyDescriptor

   suggestionProvider : SuggestionProvider | undefined = undefined

  types = DataTypes.types

  typedProperty!: Moddle.PropertyDescriptor
  typesProperty!: Moddle.PropertyDescriptor

  typeHints: EditorSettings<string> = {
    oneOf: DataTypes.types
  }

 valueSettings: EditorSettings<string> = {}
 sourceSettings: EditorSettings<string> = {
     oneOf: ["value", "input", "expression"], 
 }


  // constructor

  constructor(extensionEditor: ExtensionEditor) {
    super()

    extensionEditor.computeLabel = (element: Element) => element.get("name") || "<name>"
  }

// private

  findProcess(element: Element) : Element {
    while ( element.$type !== "bpmn:Process")
      element = element.$parent

    return element
  }

 findInputVariables(element: Element) : string[]{
    const process = this.findProcess(element)

    const extensions : Element[] = process['extensionElements']?.values || []

    const schema = extensions.find((extension: Element) => extension.$type == "schema:schema" && extension["name"] == "input")
    if ( schema )
      return schema['properties'].filter((extension: Element) => extension.$type == "schema:property").map((property: any) => property["name"])
    else
      return []
  }

  setSuggestionProvider() {
    this.valueSettings.suggestionProvider = undefined
    this.suggestionProvider  = undefined

    if ( this.element["source"] == "input") {
      this.suggestionProvider = new ArraySuggestionProvider(this.findInputVariables(this.element))
    }

   this.valueSettings.suggestionProvider = this.suggestionProvider
  }

// callbacks

 changeSource(source: string) {
    this.element["source"] = source

    this.setSuggestionProvider()

    this.setType()
  }

  baseType(type: string) {
    switch ( type ) {
      case "Boolean":
        return "boolean"

      case "String":
        return "string"

      case "Short":
      case "Integer":
      case "Long":
      case "Double":
        return "number"
    }

    return "string"
  }

  setType() {
    if ( this.element["source"] == "value") {
      const type =  this.element["type"] || "String"
      this.typedProperty = this.createProperty("value",type)

      if ("string" !== this.baseType(type)) {
        this.valueSettings.in = AbstractPropertyEditor.getConversion("string", this.baseType(type))
        this.valueSettings.out = AbstractPropertyEditor.getConversion(this.baseType(type), "string")
      }
      else {
        delete this.valueSettings.in
        delete this.valueSettings.out
      }
    }
    else
      this.typedProperty = this.createProperty("value", "String")
  }

  typeChange(event: any) {
    //this.typedProperty = this.createProperty("value", this.element["type"] || "String")

    this.setType()
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

      this.isInput = this.element.$parent["name"] == "input"

      this.name =  this.element.$descriptor.properties.find((prop) => prop.name === "name")!
      this.type =  this.element.$descriptor.properties.find((prop) => prop.name === "type")!
      this.source =  this.element.$descriptor.properties.find((prop) => prop.name === "source")!
      this.constraint =  this.element.$descriptor.properties.find((prop) => prop.name === "constraint")!
      this.value =  this.element.$descriptor.properties.find((prop) => prop.name === "value")!

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type", "constraint", "value"].includes(prop.name))

      this.setSuggestionProvider()
      this.typeChange("")
  }
}
