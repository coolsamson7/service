/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel';

import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Type, TypeParser, ValidationModule } from '@modulefederation/common';

import { ValidationError } from "../../validation";
import { ChipsComponent } from './chips.component';


@RegisterPropertyEditor("schema:Constraint")
@Component({
  selector: "constraint-editor",
  templateUrl: './constraint-editor.html',
  //styleUrl: "./constraint-editor.scss",
  standalone: true,
  imports: [
    // angular

    FormsModule,
    CommonModule,

    // material

    MatInputModule,
     MatFormFieldModule,

    // more

    ValidationModule,

    ChipsComponent
    ]
})
export class ConstraintPropertyEditor extends AbstractPropertyEditor<number> implements OnChanges{
  // input

  @Input() type!: string;

  // instance data

  @ViewChild("model") model! : NgModel;
  @ViewChild("input") input! : any;
  @ViewChild("chips") chips! : ChipsComponent;

   get constraintType() :string {
    switch (this.element["type"]) {
      case "Integer":
      case "Short":
      case "Long":
      case "Double":
        return "number"

      case "String":
        return "string";

      case "Boolean":
        return "boolean"

      default:
        return "string"
      }
    }

   // constructor

   constructor() {
    super()

    this.baseType = "string"
  }

  // implement OnChanges

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes)

    if ( changes["type"] ) {
      this.type = changes["type"]!.currentValue;

      // check if the constraints are still valid!

      let update = false
      let i = 0
      for ( const item of [...this.chips.items]) {
        if (!TypeParser.supportsConstraint(this.constraintType, item.name)) {
          this.chips.items.splice(i, 1)
          update = true
        }

       i++
      } // for

      if ( update ) {
        const newConstraints = this.chips.format()

        this.onChange(newConstraints)
      }
    }
  }

  // implement OnInit

  override ngOnInit() {
    super.ngOnInit()

    if ( !this.get("constraint"))
      this.set("constraint", "")
  }

   // override AbstractPropertyEditor

    override showError(error: ValidationError, select: boolean) {
      super.showError(error, select)

      this.model.control.markAsTouched()
      if ( select ) {
          this.input.nativeElement.focus()
      }
    }

}
