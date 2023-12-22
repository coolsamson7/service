import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmationButton {
  label : string;
  result : any
  primary? : boolean
}

export interface ConfirmationModel {
  title : string;
  type : string;
  message : string;
  buttons : ConfirmationButton[]
}

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.scss']
})
export class ConfirmationDialog implements OnInit {
  constructor(
    public dialogRef : MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data : ConfirmationModel,
  ) {
  }

  // callbacks

  icon() {
    switch (this.data.type) {
      case "info":
        return "info"
      case "warning":
        return "warn"
      case "error":
        return "error"
    }

    return ""
  }

  click(button : ConfirmationButton) : void {
    this.dialogRef.close(button.result);
  }

  // implement OnInit
  ngOnInit() : void {
    let button = this.data.buttons.find(button => button.primary)

    if (button)
      this.dialogRef.keydownEvents().subscribe(event => {
        //if (event.key === "Escape") {
        //    this.cancel();
        //}

        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          this.dialogRef.close(button!!.result);
        }
      });
  }
}
