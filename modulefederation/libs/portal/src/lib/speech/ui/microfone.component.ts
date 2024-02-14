import { CommonModule } from "@angular/common"
import { Component, ElementRef } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"

@Component({
    selector: "microfone-icon",
    templateUrl: "./microfone.component.html",
    styleUrl: "./microfone.component.scss",
    standalone: true,
    imports: [MatIconModule, CommonModule]
})
export class MicrofoneComponent {
    // instance data

    on = false

    // constructor

    constructor(private el: ElementRef) {
    }

    // public

    visibility(on: boolean) {
        this.on = on
   }
}