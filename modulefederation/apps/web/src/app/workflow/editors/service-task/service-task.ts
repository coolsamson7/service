/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, ViewChild } from '@angular/core';

import { Element } from 'moddle';
import { AbstractPropertyEditor, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';

import { ArraySuggestionProvider, NgModelSuggestionsDirective } from "@modulefederation/portal";
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceTaskDescriptor, TaskDescriptorInventoryService } from '../../service/task-service-descriptor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModelValidationDirective, ValidationError } from '../../validation';
import { CommandBuilder } from '../../bpmn';


@RegisterPropertyEditor("bpmn:implementation")
@Component({
  selector: "service-task",
  templateUrl: './service-task.html',
  styleUrl: './service-task.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyPanelModule, MatFormFieldModule, MatInputModule, NgModelSuggestionsDirective, ModelValidationDirective]
})
export class ServiceTaskEditor extends AbstractPropertyEditor {
  // static data

  static descriptors : ServiceTaskDescriptor[] | undefined = undefined
  static suggestionProvider : ArraySuggestionProvider = new ArraySuggestionProvider([])


  // instance data

  @ViewChild("model") model! : NgModel;
  @ViewChild("input") input! : any;

  selectedService!: ServiceTaskDescriptor | undefined
  suggestionProvider = ServiceTaskEditor.suggestionProvider

  // constructor

  constructor(taskDescriptorService: TaskDescriptorInventoryService) {
    super()

    if (!ServiceTaskEditor.descriptors) {
      taskDescriptorService.getTasks().subscribe(descriptors => {
        ServiceTaskEditor.descriptors = descriptors
        ServiceTaskEditor.suggestionProvider = new ArraySuggestionProvider(descriptors.map(descriptor => descriptor.name))
    })
  }
  }

  // private

  private getInputOutputElement(builder: CommandBuilder) : Element {
    // take care of extension elements

    let extensionElement = this.get<Element>("extensionElements")

    if (!extensionElement) {
      extensionElement = this.create('bpmn:ExtensionElements', {
        $parent: this.element,
        values: []
        });

      builder
        .updateProperties({
          element: this.shape,
          moddleElement: this.element,
          properties: {
            extensionElements: extensionElement
          }
        });
    }
    else if ( !extensionElement["values"] )
        extensionElement["values"] = []

      // input & output

      let inputOutputElement = extensionElement['values'].find((extensionElement: any) => extensionElement.$instanceOf("camunda:InputOutput"))

      if ( !inputOutputElement) {
      inputOutputElement = this.create("camunda:InputOutput", {$parent: extensionElement});

      builder
        .updateProperties({
          element: this.shape,
          moddleElement: extensionElement,
          properties: {
            values: [...extensionElement['values'], inputOutputElement]
          },
        });

        extensionElement['values'].push(inputOutputElement)
      }

      // create inputs

      if (!inputOutputElement['inputParameters'])
        inputOutputElement['inputParameters'] = []

      // create outputs

      if (!inputOutputElement['outputParameters'])
        inputOutputElement['outputParameters'] = []

      return inputOutputElement
  }

  private defaultParameter(type: string) {
    switch ( type ) {
      case "Boolean":
        return "false"

      case "String":
        return ""
        
      case "Short":
      case "Integer":
      case "Long":
      case "Double":
        return "0"
    }

    return ""
  }

  private setService(descriptor : ServiceTaskDescriptor | undefined) {
    if ( descriptor !== this.selectedService) {
      const builder = this.actionHistory.commandBuilder()

      const previousService = this.selectedService

      this.selectedService = descriptor;

      const inputOutputElement = this.getInputOutputElement(builder)

      if ( descriptor ) {
        // expression

        builder.updateProperties({
          element: this.shape,
          moddleElement: this.element,
          properties: {
            expression: `\${${descriptor.name}.execute(execution)}`
          },
          reverted: () => {this.selectedService = previousService;}
        })

        // input

        const inputParameters = descriptor.input.map(input => this.create("schema:inputParameter", {
          $parent: inputOutputElement,
          name: input.name,
          source: "value",
          type: input.type,
          value: this.defaultParameter(input.type)
        }))

        // output

        const outputParameters = descriptor.input.map(input => this.create("schema:outputParameter", {
          $parent: inputOutputElement,
          name: input.name,
          source: "value",
          type: input.type,
        }))

        // add 2 builder

        builder.updateProperties({
          element: this.shape,
          moddleElement: inputOutputElement,
          properties: {
            inputParameters: [ ...inputParameters],
            outputParameters: [...outputParameters]
          }
        })
      } // if
      else {
        builder.updateProperties({
          element: this.shape,
          moddleElement: this.element,
          properties: {
            expression: `` // ?
          },
          reverted: () => {this.selectedService = previousService;}
        })

        builder.updateProperties({
          element: this.shape,
          moddleElement: inputOutputElement,
          properties: {
            inputParameters: [],
            outputParameters: []
          }
        })
      }

      builder.execute()
    } // if
  }

  private findService(serviceName: string) {
    return (ServiceTaskEditor.descriptors || []).find(descriptor => descriptor.name == serviceName)
  }

  // callbacks

  override onChange(serviceName: any) {
    super.onChange(serviceName)

    this.setService(this.findService(serviceName))
  }

  // override AbstractPropertyEditor

  override showError(error: ValidationError, select: boolean) {
    super.showError(error, select)

    this.model.control.markAsTouched()
    if ( select ) {
        this.input.nativeElement.focus()
    }
  }

  // override OnInit

 override ngOnInit() : void {
    super.ngOnInit()

    // lets check the current service

    const expression = this.element["expression"] || "${.execute(execution)}"

    const service = expression.substring(2, expression.indexOf("."))

    this.selectedService = this.findService(service)
  }
}
