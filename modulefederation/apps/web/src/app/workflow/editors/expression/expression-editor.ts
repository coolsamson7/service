/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Element } from "moddle"
import { AbstractPropertyEditor, PropertyPanelModule, RegisterPropertyEditor } from '../../property-panel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PropertyNameComponent } from '../../property-panel/property-name';


@RegisterPropertyEditor("bpmn:Expression")
@Component({
  selector: "expression-editor",
  templateUrl: './expression-editor.html',
  styleUrl: './expression-editor.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, PropertyPanelModule, PropertyNameComponent]
})
export class ExpressionEditor extends AbstractPropertyEditor implements OnChanges {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  // constructor

  constructor() {
    super()
  }

  // private

  private setup() {
    let condition = this.get<Element>("conditionExpression")

    if ( !condition) {
      this.set("conditionExpression", condition = this.create("bpmn:Expression", {$parent: this.element}))
      const builder = this.actionHistory.commandBuilder()
            .updateProperties({
              element: this.shape,
              moddleElement: this.element,
              properties: {
                conditionExpression: condition
              },
              oldProperties: {
                conditionExpression: undefined
              },
              reverted: () => {
                this.setup()
              }
            });

       (<any>condition)["$builder"] = builder
      }

      this.properties = condition.$descriptor.properties.filter((prop: { name: string; }) => ["body"].includes(prop.name))
  }

  // implement OnChanges

  override ngOnChanges(changes : SimpleChanges) : void {
    super.ngOnChanges(changes)
    
      if (changes['element'] && !changes['element'].isFirstChange())
        this.setup()
  }

  // override OnInit

  override ngOnInit() : void {
      /*this.settings = {
        in: (value : string) => {
          if ( value.startsWith("${")) {
            return value.substring(2, value.length - 1)
          }
          else return value
        },
        out: (value : string) => {
          if ( value.startsWith("${"))
            return value
          else
             return `\${${value}`
        }
      }*/

      super.ngOnInit()

      this.setup();
     }
}
