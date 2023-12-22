import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface DialogData {
  remote : string;
}

@Component({
  selector: 'add-manifest-dialog',
  templateUrl: 'add-manifest-dialog.html'
})
export class AddManifestDialog implements OnInit {
  constructor(
    public dialogRef : MatDialogRef<AddManifestDialog>,
    @Inject(MAT_DIALOG_DATA) public data : DialogData,
  ) {
  }

  onNoClick() : void {
    this.dialogRef.close(undefined);
  }

  ngOnInit() : void {
    this.dialogRef.keydownEvents().subscribe(event => {
      //if (event.key === "Escape") {
      //    this.cancel();
      //}

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        this.dialogRef.close(this.data.remote);
      }
    });
  }
}
