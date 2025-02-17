/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { AbstractPropertyEditor, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@RegisterPropertyEditor("bpmn:documentation") // TODO falsch!
@Component({
  selector: "documentation-area-editor",
  templateUrl: './documentation-editor.html',
  //styleUrl: "./documentation-editor.scss",
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DocumentationPropertyEditor extends AbstractPropertyEditor implements OnInit {
  override get value() : any {
    const values = this.element.get(this.property.name)
    if ( !values )
      return ""
    else {
      if ( values.length == 1)
        return values[0].text
    else
      return ""
    }
  }

  override set value(value: any) {
    let values = this.element.get(this.property.name)

    if ( !values ) {
      this.element.set(this.property.name, values = [])
    }

    if (values.length == 0) {
      values.push(this.element['$model'].create("bpmn:Documentation"))
    }

    values[0].text = value
  }

  ngOnInit(): void {
    console.log("k")
  }
}
