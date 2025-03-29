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
  inputOutputElement!: Element

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
          const inputParameter =  this.create("schema:inputParameter", {
            $parent: this.inputOutputElement,
            name: input.name,
            source: "value",
            type: input.type,
            value: ""
          });

          (<any>this.inputOutputElement)["inputParameters"].push(inputParameter);
        }

        // output

        for ( const input of descriptor.output) {
          const outputParameter =  this.create("schema:outputParameter", {
            $parent: this.inputOutputElement,
            name: input.name,
            type: input.type
          });

          (<any>this.inputOutputElement)["outputParameters"].push(outputParameter);
        }
      }
    }
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

    // lets see if we need to add parent elements

    const builder = this.actionHistory.commandBuilder()

    // take care of extension elements

    let extensionElement = this.element["extensionElements"]

    if (!extensionElement) {
      this.set("extensionElements", extensionElement = this.create('bpmn:ExtensionElements', {
        $parent: this.element,
        values: []
        }));

      builder
        .updateProperties({
          element: this.shape,
          moddleElement: this.element,
          properties: {
            extensionElements: extensionElement
          },
          oldProperties: {
            extensionElement: undefined
          },
          //reverted: () => {
          //  this.setup()
          //}
        });
    }
   else if ( !extensionElement.values )
       extensionElement.values = []

     // input & output

     let inputOutputElement = extensionElement.values.find((extensionElement: any) => extensionElement.$instanceOf("camunda:InputOutput"))

     if ( !inputOutputElement) {
      inputOutputElement = this.create("camunda:InputOutput", {$parent: extensionElement});

      builder
        .updateProperties({
          element: this.shape,
          moddleElement: extensionElement,
          properties: {
            values: [...extensionElement.values, inputOutputElement]
          },
          oldProperties: {
            extensionElement: [...extensionElement.values]
          },
          //reverted: () => {
          //  this.setup()
          //}
        });

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

      const expression = this.element["expression"] || "${.execute(execution)}"

      const service = expression.substring(2, expression.indexOf("."))

      this.selectedService = this.findService(service)
  }
}
