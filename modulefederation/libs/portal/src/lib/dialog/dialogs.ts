import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import { InputDialogBuilder } from "./input-dialog-builder";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";
import { Translator } from "../i18n";
import { ShortcutManager } from "../shortcuts";

export interface ButtonConfiguration {
    label : string,
    result : any,
    primary? : boolean
}

@Injectable({providedIn: 'root'})
export class Dialogs {
    // constructor

    constructor(private dialog : MatDialog, private translator: Translator, private shortcutManager: ShortcutManager) {
    }

    // public

    confirmationDialog() : ConfirmationDialogBuilder {
        return new ConfirmationDialogBuilder(this.dialog, this.translator, this.shortcutManager)
    }

    inputDialog() : InputDialogBuilder {
        return new InputDialogBuilder(this.dialog, this.translator, this.shortcutManager)
    }
}
