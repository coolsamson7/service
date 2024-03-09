import { Component, Input, OnInit } from "@angular/core";

@Component({
    standalone: true,
    selector: 'manifest',
    templateUrl: "./manifest.component.html",
    styleUrls: ["./manifest.component.scss"]
})
export class ManifestComponent implements OnInit {
   // inputs

    @Input() manifest! : any

   // constructor

   constructor() {}

   // implement OnInit

   ngOnInit(): void {
    // noop
   }
}
