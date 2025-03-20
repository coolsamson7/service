import { CommonModule } from "@angular/common";
import { FormsModule, NgModel } from "@angular/forms";
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';
import { Component, SimpleChanges, ViewChild } from "@angular/core";
import { ArraySuggestionProvider, FeatureRegistry, MessageBus, NgModelSuggestionsDirective, SuggestionProvider } from "@modulefederation/portal";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { ModelValidationDirective, ValidationError } from "../../validation";
import { ValidationModule } from "@modulefederation/common";


 @RegisterPropertyEditor("camunda:formKey")
 @Component({
  selector: "form-editor",
  styleUrl: "./form-editor.scss",
  templateUrl: "./form-editor.html",
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatMenuModule, MatIconModule, NgModelSuggestionsDirective, ModelValidationDirective, ValidationModule]
 })
 export class FormPropertyEditor extends AbstractPropertyEditor {
    // instance data
  
    @ViewChild("model") model! : NgModel;
    @ViewChild("input") input! : any;
  
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

    super.onChange( this.type + ":" + this.name)
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

  parseForm() {
    let value = this.value
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

  // override

  override onChange(event: any) {
    this.name = event

    super.onChange( this.type + ":" + this.name)
  }

    // override AbstractPropertyEditor
    
      override showError(error: ValidationError, select: boolean) {
        super.showError(error, select)
    
        this.model.control.markAsTouched()
        if ( select ) {
            this.input.nativeElement.focus()
        }
      }
    

  // implement onInit

  override ngOnInit(): void {
    super.ngOnInit()

    this.parseForm()
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes)
    
    this.parseForm()
  }
 }
