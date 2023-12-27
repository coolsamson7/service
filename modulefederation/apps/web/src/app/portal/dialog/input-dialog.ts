
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { InputDialogConfig } from "./input-dialog-builder";
import { ButtonConfiguration } from "./dialogs";

@Component({
    selector: 'input-dialog',
    templateUrl: './input-dialog.html',
    styleUrls: ['./input-dialog.scss']
})
export class InputDialog implements OnInit {
    // instance data

    value: any

    // constructor

    constructor(
        public dialogRef : MatDialogRef<InputDialog>,
        @Inject(MAT_DIALOG_DATA) public data : InputDialogConfig,
    ) {
        this.value = data.defaultValue
    }

    // callbacks

    click(button : ButtonConfiguration) : void {
        if ( button.result == true)
            this.dialogRef.close(this.value);
        else
            this.dialogRef.close(undefined);
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

                    this.dialogRef.close(this.value);
                }
            });
    }
}
