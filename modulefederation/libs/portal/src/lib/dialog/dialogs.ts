/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Component, Injectable, OnInit, inject } from "@angular/core";
import { InputDialogBuilder } from "./input-dialog-builder";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";
import { tap } from "rxjs/operators";
import { ComponentType } from "@angular/cdk/overlay";
import { Observable } from "rxjs";
import { Translator } from "../i18n";
import { get } from "../common";

export interface ButtonConfiguration {
    label?: string
    shortcut?: string
    tooltip?: string
    speech?: string
    i18n?: string

    result : any
    primary? : boolean
}

export interface ButtonData extends ButtonConfiguration {
  run: () => any
}

export interface Dialogs {
  openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any>

  confirmationDialog() : ConfirmationDialogBuilder

  inputDialog() : InputDialogBuilder
}

export interface DialogListener {
  openDialog() : void
  closedDialog() : void
}

@Injectable({providedIn: 'root'})
export class DialogService implements Dialogs {
    // instance data

    private listener: DialogListener[] = []

    // constructor

    constructor(private dialog : MatDialog) {
    }

    // public

    addListener(listener: DialogListener) {
      this.listener.push(listener)
    }

    openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any> {
      // call listener ( e.g. shortcut manger )

      for ( const listener of this.listener)
        listener.openDialog()

      return  this.dialog.open(component, configuration).afterClosed()
        .pipe(
          // call listener
          tap(() => this.listener.forEach(listener => listener.closedDialog()))
        )
    }

    confirmationDialog() : ConfirmationDialogBuilder {
      return new ConfirmationDialogBuilder(this)
    }

    inputDialog() : InputDialogBuilder {
      return new InputDialogBuilder(this)
    }
}
