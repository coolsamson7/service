import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
export interface DialogData {
  remote: string;
}
@Component({
  selector: 'add-manifest-dialog',
  templateUrl: 'add-manifest-dialog.html'
})
export class AddManifestDialog {
  constructor(
    public dialogRef: MatDialogRef<AddManifestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
