import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { I18nModule, PortalComponentsModule } from "@modulefederation/portal";
import { ErrorEntry } from "./global-error-handler";

export interface ErrorDialogConfig {
  title: string,
  message: string,
  error: ErrorEntry
}
@Component({
  selector: 'error-dialog',
  templateUrl: './error-dialog.html',
  styleUrls: ['./error-dialog.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatListModule, PortalComponentsModule, I18nModule]
})
export class ErrorDialog implements OnInit {
  // instance data


  // constructor

  constructor(
    public dialogRef : MatDialogRef<ErrorDialog>,
    @Inject(MAT_DIALOG_DATA) public data : ErrorDialogConfig,
  ) {
  }

  // callbacks

  formatError(error: ErrorEntry):string {
    if ( error.error instanceof Error) {
      return error.error.constructor.name + ": " + error.error.message
    }
    else {
      return error.error
    }
  }

  ok() {
    this.dialogRef.close(true);
  }

  // implement OnInit
  ngOnInit() : void {
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        this.ok()
      }
    });
  }
}
