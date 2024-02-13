import { CommonModule } from "@angular/common"
import { Component, ElementRef, OnInit } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"

@Component({
    selector: "microfone-icon",
    templateUrl: "./microfone.component.html",
    styleUrl: "./microfone.component.scss",
    standalone: true,
    imports: [MatIconModule, CommonModule]
})
export class MicrofoneComponent implements OnInit {
    // instance data

    on = false

    // constructor

    constructor(private el: ElementRef) {
    }

    // public

    visibility(on: boolean) {
        this.on = on
   }

   // implement OnInit

   ngOnInit() { /*
        const nativeElement: HTMLElement = this.el.nativeElement
        const parentElement = nativeElement.parentElement!

            // move all children out of the element
            
        while (nativeElement.firstChild)
            parentElement.insertBefore(nativeElement.firstChild, nativeElement)
        
        // remove the empty element(the host)

        parentElement.removeChild(nativeElement)*/
    }
}