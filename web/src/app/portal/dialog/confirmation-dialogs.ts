import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import {ConfirmationDialog } from "./confirmation-dialog";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class ConfirmationDialogs {
  // constructor

  constructor(private dialog : MatDialog) {
  }

  // public

  okCancel(title: string, question) :Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
          title: title,
          message: question,
          buttons: [
            {
              label: "Ok",
              result: true,
              primary: true
            },
            {
              label: "Cancel",
              result: false
            }
          ]
        }
      });

    return dialogRef.afterClosed()
  }
}
