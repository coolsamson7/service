import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class ConfirmationDialogs {
  // constructor

  constructor(private dialog : MatDialog) {
  }

  // public
  ok(title : string, message : string) : Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: title,
        message: message,
        buttons: [
          {
            label: "Ok",
            result: true,
            primary: true
          }
        ]
      }
    });

    return dialogRef.afterClosed()
  }

  okCancel(title : string, question : string) : Observable<boolean> {
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
