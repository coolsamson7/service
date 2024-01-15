import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import { InputDialogBuilder } from "./input-dialog-builder";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";
import { Translator } from "../i18n";
import { ShortcutManager } from "../shortcuts";
import { tap } from "rxjs/operators";
import { ComponentType } from "@angular/cdk/overlay";
import { Observable } from "rxjs";

export interface ButtonConfiguration {
    label : string,
    result : any,
    primary? : boolean
}

export interface Dialogs {
  openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any>

  confirmationDialog() : ConfirmationDialogBuilder

  inputDialog() : InputDialogBuilder
}


@Injectable({providedIn: 'root'})
export class DialogService implements Dialogs {
    // constructor

    constructor(private dialog : MatDialog, private translator: Translator, private shortcutManager: ShortcutManager) {
    }

    // public

  openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any> {
    this.shortcutManager.pushLevel()

    return  this.dialog.open(component, configuration).afterClosed()
      .pipe(
        tap(() => this.shortcutManager.popLevel())
      )
  }

    confirmationDialog() : ConfirmationDialogBuilder {
        return new ConfirmationDialogBuilder(this, this.translator)
    }

    inputDialog() : InputDialogBuilder {
        return new InputDialogBuilder(this, this.translator)
    }
}
