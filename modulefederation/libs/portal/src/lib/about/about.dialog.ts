import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ModuleMetadata, ModuleRegistry } from "@modulefederation/portal";

@Component({
    selector: 'about-dialog',
    templateUrl: './about.dialog.html'
})
export class AboutDialog implements OnInit {
    // instance data

    dataSource : ModuleMetadata[] = []
    displayedColumns : string[] = ['name', 'type', 'version', 'isLoaded'];

    // constructor
    constructor(
        public dialogRef : MatDialogRef<AboutDialog>,
        public moduleRegistry : ModuleRegistry
        //@Inject(MAT_DIALOG_DATA) public data: ConfirmationModel,
    ) {
        this.dataSource = Object.values(moduleRegistry.modules)
    }

    // callbacks

    // implement OnInit
    ngOnInit() : void {
        this.dialogRef.keydownEvents().subscribe(event => {
            //if (event.key === "Escape") {
            //    this.cancel();
            //}

            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                this.dialogRef.close();
            }
        });
    }
}