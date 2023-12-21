import { MatDialog } from "@angular/material/dialog";
import { Injectable } from "@angular/core";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Observable } from "rxjs";

export interface ButtonConfiguration {
  label: string,
  result: any,
  primary?: boolean
}
export class ConfirmationDialogBuilder {
  // instance data

  configuration = {
    type: "info",
    title: "",
    message: "",
    buttons: []
  }

  // constructor

  constructor(private dialog : MatDialog) {
  }

  // fluent

  /**
   * set the dialog type
   * @param type the type
   */
  type(type: "info" | "warning" | "error"): ConfirmationDialogBuilder {
    this.configuration.type = type;

    return this;
  }

  /**
   * set the dialog title
   * @param title the title
   */
  title(title: string): ConfirmationDialogBuilder {
    this.configuration.title = title;

    return this;
  }

  /**
   * set the dialog message
   * @param message the message
   */
  message(message: string): ConfirmationDialogBuilder {
    this.configuration.message = message;

    return this;
  }

  /**
   * add a button
   * @param button the {@link ButtonConfiguration}
   */
  button(button: ButtonConfiguration): ConfirmationDialogBuilder {
    this.configuration.buttons.push(button);

    return this;
  }

  // convenience

  /**
   * add "ok"
   */
  public ok(): ConfirmationDialogBuilder {
    return this
      .button({
        label: "Ok",
        result: true
      })
  }

  /**
   * add "ok" and "cancel" buttons
   */
  public okCancel(): ConfirmationDialogBuilder {
    return this
      .button({
        label: "Ok",
        result: true
      })
      .button({
        label: "Cancel",
        result: undefined
      });
  }

  // show

  /**
   * show the dialog and return the button value
   */
  show(): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: this.configuration
    });

    return dialogRef.afterClosed()
  }
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
            label: "Cancel",
            result: false
          },
          {
            label: "Ok",
            result: true,
            primary: true
          },
        ]
      }
    });

    return dialogRef.afterClosed()
  }
}
