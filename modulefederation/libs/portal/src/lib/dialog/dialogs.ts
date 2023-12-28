import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import { InputDialogBuilder } from "./input-dialog-builder";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";

export interface ButtonConfiguration {
    label : string,
    result : any,
    primary? : boolean
}

@Injectable({providedIn: 'root'})
export class Dialogs {
    // constructor

    constructor(private dialog : MatDialog) {
    }

    // public

    confirmationDialog() : ConfirmationDialogBuilder {
        return new ConfirmationDialogBuilder(this.dialog)
    }

    inputDialog() : InputDialogBuilder {
        return new InputDialogBuilder(this.dialog)
    }
}
