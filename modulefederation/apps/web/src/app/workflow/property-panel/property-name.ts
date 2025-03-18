
import { AfterContentInit, Component, Input, OnInit } from "@angular/core"
import  { PropertyDescriptor } from "moddle"
import { PropertyGroupComponent } from "./property-group";
import { PropertyEditor } from "./editor";


@Component( {
  selector: 'property-name',
  templateUrl: "./property-name.html",
  styleUrl: "./property-name.scss",
})
export class PropertyNameComponent implements AfterContentInit {

  // input

  @Input() property! : PropertyDescriptor;
  @Input() group! : PropertyGroupComponent

  // instance data

  editor!: PropertyEditor

  // public

  isDirty() : boolean {
    return this.editor.isDirty()
  }

  undo() {
    if ( this.isDirty())
        this.editor.undo()
  }

  // implement OnInit

  ngAfterContentInit() {
    this.editor = this.group.editors.find((editor) => editor.property == this.property)?.instance as PropertyEditor

    console.log(this.editor)
  }
}