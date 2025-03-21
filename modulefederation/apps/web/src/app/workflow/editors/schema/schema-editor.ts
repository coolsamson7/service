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



@RegisterPropertyEditor("schema:schema")
@Component({
  selector: "schema-editor",
  templateUrl: './schema-editor.html',
  styleUrl: './schema-editor.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyPanelModule, SvgIconComponent, PropertyNameComponent]
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

      this.actionHistory.updateProperties({
        element: this.shape,
        moddleElement: this.element as any as Element,
        properties: {
          properties: [...this.properties, newProperty]
        }
      })

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