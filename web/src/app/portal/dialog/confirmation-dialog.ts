
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmationButton {
  label: string;
  result: any
  primary?: boolean
}
export interface ConfirmationModel {
  title: string;
  message: string;
  buttons: ConfirmationButton[]
}
@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html'
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationModel,
  ) {}

  // callbacks

  click(button: ConfirmationButton): void {
    this.dialogRef.close(button.result);
  }
}
