/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';

import { Element } from "moddle"

import { AbstractExtensionEditor, EditorSettings, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyNameComponent } from '../../property-panel/property-name';
import { ArraySuggestionProvider } from '@modulefederation/portal';


@RegisterPropertyEditor("camunda:OutputParameter")
@Component({
  selector: "process-output-parameter",
  templateUrl: './process-output.html',
  styleUrl: './process-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyPanelModule, PropertyNameComponent]
})
export class ProcessOutputParameterEditor extends AbstractExtensionEditor {
  // instance data

  name!: Moddle.PropertyDescriptor
  value!: Moddle.PropertyDescriptor

  nameSettings: EditorSettings<string> = {
  }

  valueSettings: EditorSettings<string> = {
    in: (value: string) => {
        if ( value.startsWith("${"))
            return value.substring(2, value.length - 1)
        else
            return value
    },
    out: (value: string) => {
        return `\${${value}}`
    }
  }

  // private

    findProcess(element: Element) : Element {
        while ( element.$type !== "bpmn:Process")
        element = element.$parent

        return element
    }

    findProcessVariables(element: Element) : string[]{
        const process = this.findProcess(element)
    
        const extensions : Element[] = process['extensionElements']?.values || []
    
        const schema = extensions.find((extension: Element) => extension.$type == "schema:schema")
        if ( schema )
            return schema['properties'].filter((extension: Element) => extension.$type == "schema:property").map((property: any) => property["name"])
        else
            return []
        }
    

  // override OnInit

  override ngOnInit() : void {
    super.ngOnInit()

    this.nameSettings.suggestionProvider = new ArraySuggestionProvider(this.findProcessVariables(this.element))

      //this.readOnly = this.context.shape["bpmnElement"].$type == "bpmn:ServiceTask"

    this.name = this.prop("name")
    this.value = this.prop("value")
  }
}
