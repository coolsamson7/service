import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AboutDialog } from "./about.dialog";

@Injectable({providedIn: 'root'})
export class AboutDialogService {
    // instance data

    // constructor

    constructor(private dialog : MatDialog) {
    }

    // public
    show() {
        const dialogRef = this.dialog.open(AboutDialog, {
            data: {}
        });

        return dialogRef.afterClosed()
    }
}


