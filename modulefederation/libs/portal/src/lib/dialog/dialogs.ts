import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import { InputDialogBuilder } from "./input-dialog-builder";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";
import { Translator } from "../i18n";
import { ShortcutManager } from "../shortcuts";
import { PreferencesDialog } from "../../../../../apps/web/src/app/home/preferences-dialog";
import { tap } from "rxjs/operators";
import { ComponentType } from "@angular/cdk/overlay";

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

  open<T>(component: ComponentType<T>, configuration: any) {
    this.shortcutManager.pushLevel()

    const dialogRef = this.dialog.open(component, {
      //height: '40%', TODO
      //width: '60%',
      data: configuration
    });

    return dialogRef.afterClosed()
      .pipe(
        tap(() => this.shortcutManager.popLevel())
      )
  }

    confirmationDialog() : ConfirmationDialogBuilder {
        return new ConfirmationDialogBuilder(this.dialog, this.translator, this.shortcutManager)
    }

    inputDialog() : InputDialogBuilder {
        return new InputDialogBuilder(this.dialog, this.translator, this.shortcutManager)
    }
}
