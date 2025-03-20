
import { Component, Input } from "@angular/core"
import { PropertyDescriptor } from "moddle"
import { PropertyEditor } from "./property-editor";
import { CommonModule } from "@angular/common";


@Component( {
  selector: 'property-name',
  templateUrl: "./property-name.html",
  styleUrl: "./property-name.scss",
  standalone: true,
  imports: [CommonModule]
})
export class PropertyNameComponent {
  // input

  @Input() property! : PropertyDescriptor;

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
}