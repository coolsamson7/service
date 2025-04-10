import { CommonModule } from "@angular/common"
import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatMenuModule } from "@angular/material/menu"
import { MatDividerModule } from "@angular/material/divider"
import { MatIconModule } from "@angular/material/icon"
import { TypeEditorComponent } from "./type-editor"

@Component({
    selector: 'type-editor-menu',
    templateUrl: './type-menu.html',
    styleUrl: './type-menu.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        // angular

        CommonModule,
        FormsModule,

        // material

        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule
    ]
})
export class TypeMenuComponent implements OnInit {
    // input

    @Input() label = ""
    @Input() type!: TypeEditorComponent
    @Input() parent? : TypeMenuComponent = undefined

    opened = false

    // instance data

    // protected


     typeName(type: string) : string {
        if ( this.parent )
            return this.parent.typeName(`Array<${type}>`)
        else
            return type
    }

    // callbacks

    selectType(type: string) {
        this.type.selected(this.typeName(type))
    }

    open() {
        this.opened = true
    }

    isRoot() {
        return this.parent == undefined
    }

    // implement OnInit

    ngOnInit(): void {
        this.opened = this.isRoot()
    }
}
