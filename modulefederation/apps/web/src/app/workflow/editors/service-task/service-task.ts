/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Directive, Input, NgModule , OnInit} from '@angular/core';


import { AbstractPropertyEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { ArraySuggestionProvider, NgModelSuggestionsDirective, SuggestionProvider } from "@modulefederation/portal";
import { AbstractControl, FormsModule, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceTaskDescriptor, TaskDescriptorInventoryService, TaskDescriptorService } from '../../service/task-service-descriptor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Element } from 'moddle';
import { ModelValidationDirective } from '../../validation';


@RegisterPropertyEditor("bpmn:implementation")
@Component({
  selector: "service-task",
  templateUrl: './service-task.html',
  styleUrl: './service-task.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule, MatFormFieldModule, MatInputModule, NgModelSuggestionsDirective, ModelValidationDirective]
})
export class ServiceTaskEditor extends AbstractPropertyEditor implements OnInit {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []
  openInputs: boolean[] = []
  openOutputs: boolean[] = []

  descriptors : ServiceTaskDescriptor[] = []
  selectedService!: ServiceTaskDescriptor | undefined
  suggestionProvider : ArraySuggestionProvider = new ArraySuggestionProvider([])

  inputOutputElement!: Element

  // constructor

  constructor(private taskDescriptorService: TaskDescriptorInventoryService) { // TODO
    super()
  }

  // private

  private rememberDescriptors(descriptors: ServiceTaskDescriptor[]) {
    this.descriptors = descriptors
   this.suggestionProvider = new ArraySuggestionProvider(descriptors.map(descriptor => descriptor.name))
  }

  private create(type: string) : Element {
    return this.element['$model'].create(type)
  }

  private setService(descriptor : ServiceTaskDescriptor | undefined) {
    if ( descriptor !== this.selectedService) {
      this.selectedService = descriptor;

      (<any>this.inputOutputElement)["inputParameters"] = [];
      (<any>this.inputOutputElement)["outputParameters"] = [];

      if ( descriptor ) {
        // expression

        this.element["expression"] = `\${${descriptor.name}.execute(execution)}`;

        // input

        for ( const input of descriptor.input) {
          const inputParameter =  this.create("schema:inputParameter");

          inputParameter["name"] = input.name;
          inputParameter["type"] = input.type;

          inputParameter.$parent = this.inputOutputElement;

          (<any>this.inputOutputElement)["inputParameters"].push(inputParameter);
        }

        // output

        for ( const input of descriptor.output) {
          const outputParameter =  this.create("schema:outputParameter");

          outputParameter["name"] = input.name;
          outputParameter["type"] = input.type;

          outputParameter.$parent = this.inputOutputElement;

          (<any>this.inputOutputElement)["outputParameters"].push(outputParameter);
        }
      }
    }
  }

  // callbacks

  toggleInput(i : number) {
    this.openInputs[i] = ! this.openInputs[i]
  }

  toggleOutput(i : number) {
    this.openOutputs[i] = ! this.openOutputs[i]
  }

  override onChange(serviceName: any) {
    const service = this.descriptors.find(descriptor => descriptor.name == serviceName);
    
    this.setService(service)
  }

  // override OnInit

 ngOnInit() : void {
      // take care of exension elements

      const extensionElement = this.element["extensionElements"] || (<any>this.element)['$model'].create('bpmn:ExtensionElements');

      if ( extensionElement.$parent == undefined) {
        (this.element)["extensionElements"] = extensionElement

        extensionElement.$parent = this.element

        extensionElement.values = []
      }

      if ( !extensionElement.values )
        extensionElement.values = []

      // input & putput

      const inputOutputElement = extensionElement.values.find((extensionElement: any) => extensionElement.$instanceOf("camunda:InputOutput")) || (<any>this.element)['$model'].create("camunda:InputOutput");

      if ( inputOutputElement.$parent == undefined) {
        inputOutputElement.$parent = extensionElement

        extensionElement.values.push(inputOutputElement)
      }

      this.inputOutputElement = inputOutputElement

      // create inputs

      if (!inputOutputElement['inputParameters'])
        inputOutputElement['inputParameters'] = []

      // create outputs

      if (!inputOutputElement['outputParameters'])
        inputOutputElement['outputParameters'] = []

      // lets check the current service

      this.taskDescriptorService.getTasks().subscribe(descriptors => {
         this.rememberDescriptors(descriptors)

         // what is the current service

         const expression = this.element["expression"] || "${.execute(execution)}"

         const service = expression.substring(2, expression.indexOf("."))

         this.setService(descriptors.find(descriptor => descriptor.name == service))
      })
  }
}
