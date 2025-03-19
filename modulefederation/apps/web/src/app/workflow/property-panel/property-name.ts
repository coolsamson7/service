
import { AfterContentInit, Component, Input, OnInit } from "@angular/core"
import  { PropertyDescriptor } from "moddle"
import { PropertyGroupComponent } from "./property-group";
import { PropertyEditor } from "./editor";
import { CommonModule } from "@angular/common";


@Component( {
  selector: 'property-name',
  templateUrl: "./property-name.html",
  styleUrl: "./property-name.scss",
  standalone: true,
  imports: [CommonModule]
})
export class PropertyNameComponent implements AfterContentInit {

  // input

  @Input() property! : PropertyDescriptor;
  @Input() group! : PropertyGroupComponent

  // instance data

  editor!: PropertyEditor

  // public

  isDirty() : boolean {
    return this.editor?.isDirty() || false
  }

  undo() {
    if ( this.isDirty())
        this.editor.undo()
  }

  // implement OnInit

  ngAfterContentInit() {
    if ( !this.editor)
        console.log("no editor for " + this.property!.name)
    /*this.editor = this.group.editors.find((editor) => editor.property == this.property)?.instance as PropertyEditor

    if ( !this.editor)
    console.log(this.property.name)*/
  }
}