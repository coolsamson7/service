import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';
import { Component, OnInit } from "@angular/core";
import { ArraySuggestionProvider, FeatureRegistry, MessageBus, NgModelSuggestionsDirective, SuggestionProvider } from "@modulefederation/portal";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { ModelValidationDirective } from "../../validation";


 @RegisterPropertyEditor("camunda:formKey")
 @Component({
  selector: "form-editor",
  styleUrl: "./form-editor.scss",
  templateUrl: "./form-editor.html",
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatMenuModule, MatIconModule, NgModelSuggestionsDirective, ModelValidationDirective]
 })
 export class FormPropertyEditor extends AbstractPropertyEditor {
  // instance data

  type = "feature"
  name = ""
  formNames: string[] = []
  featureSuggestionProvider : SuggestionProvider
  formSuggestionProvider : SuggestionProvider
  icons : {[type: string] : string } = {
    form: "link",
    feature: "create"
  }

  // constructor

  constructor(featureRegistry : FeatureRegistry, private messageBus: MessageBus) {
    super()

    this.featureSuggestionProvider = new ArraySuggestionProvider(featureRegistry.finder().withTag("task").find().map(feature => feature.path!))


    this.formSuggestionProvider = new ArraySuggestionProvider(this.formNames)

    this.messageBus.broadcast({
      topic: "workflow",
      message: "set-forms",
      arguments: this.formNames
    })
  }

  // public

  changeType(type: string) {
    this.type = type
  }

  addForm() {
    this.messageBus.broadcast({
      topic: "workflow",
      message: "add-form",
      arguments: this.name
    })
  }

  editForm() {
    this.messageBus.broadcast({
      topic: "workflow",
      message: "edit-form",
      arguments: this.name
    })
  }

  // override

  override onChange(event: any) {
    this.value = this.type + ":" + event
  }

  // implement onInit

  override ngOnInit(): void {
    super.ngOnInit()

      let value = this.element.get(this.property.name)
      if (!value)
        value = ""

      const colon = value.indexOf(":")

      if ( colon > 0) {
        if (value.startsWith("feature:"))
          this.type = "feature"
        else if (value.startsWith("form:"))
          this.type = "form"

        this.name = value.substring(colon + 1)
      }
      else {
        this.type = "feature"
        this.name = value
      }
  }
 }
