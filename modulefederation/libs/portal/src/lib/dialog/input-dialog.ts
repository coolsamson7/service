
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { InputDialogConfig } from "./input-dialog-builder";
import { ButtonConfiguration } from "./dialogs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCommonModule } from "@angular/material/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { CommonDialog } from "./dialog-builder";

@Component({
    selector: 'input-dialog',
    templateUrl: './input-dialog.html',
    styleUrls: ['./input-dialog.scss'],
    standalone: true,
    imports: [CommonModule, MatCommonModule, MatInputModule, MatIconModule, MatDialogModule, MatButtonModule, FormsModule, MatFormFieldModule]
})
export class InputDialog extends CommonDialog implements OnInit {
    // instance data

    value: any

    // constructor

    constructor(dialogRef : MatDialogRef<InputDialog>, @Inject(MAT_DIALOG_DATA) public data : InputDialogConfig) {
        super(dialogRef)

        this.value = data.defaultValue
    }

    // callbacks

    override click(button : ButtonConfiguration) : void {
        if ( button.result == true)
            this.dialogRef.close(this.value);
        else
            this.dialogRef.close(undefined);
    }

    // implement OnInit

     ngOnInit() : void {
        this.data.buttons.forEach(button => this.decorate(button))

        const button = this.data.buttons.find(button => button.primary)

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
