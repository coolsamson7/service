import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { TypeMenuComponent } from "./type-menu";
import { Schema } from "@modulefederation/form/renderer";
import { AbstractPropertyEditor, RegisterPropertyEditor } from "../../property-panel";

@RegisterPropertyEditor("schema:Type") // TODO
@Component({
    selector: 'type-editor',
    templateUrl: './type-editor.html',
    standalone: true,
    imports: [
        // angular

        CommonModule,
        FormsModule,

        // material

        MatMenuModule,
        MatButtonModule,
        TypeMenuComponent
    ]
})
export class TypeEditorComponent extends AbstractPropertyEditor<string> implements OnInit {
    // input & output

    // TODO @Input() schemas!: Schema[]

    @Output() changed = new EventEmitter<string>()

    // instance data

    literalTypes = ["String", "Short",  "Integer", "Long", "Float", "Double", "Boolean"]

    // callbacks

    selected(type: string) {
        this.onChange(type)

        //TODO this.changed.emit(this.type)
    }

    // implement OnInit

    override ngOnInit(): void {
        super.ngOnInit()

        // TODO this.schemaTypes = this.schemas.map(schema => schema.name)
    }
}
