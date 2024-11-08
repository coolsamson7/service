
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { ButtonConfiguration } from "./dialogs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { CommonDialog } from "./dialog-builder";
import { I18nModule } from "../i18n";
import { DynamicDialogConfig } from "./dynamic-dialog-builder";

@Component({
    selector: 'dynamic-dialog',
    templateUrl: './dynamic-dialog.html',
    styleUrls: ['./dynamic-dialog.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatDialogModule,
        MatButtonModule,
        I18nModule
    ]
})
export class DynamicDialog extends CommonDialog implements OnInit {
    // constructor

    constructor(dialogRef : MatDialogRef<DynamicDialog>, @Inject(MAT_DIALOG_DATA) public data : DynamicDialogConfig) {
        super(dialogRef)
    }

    // callbacks

    override click(button : ButtonConfiguration) : void {
        this.dialogRef.close(button.result);
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

                    this.dialogRef.close(button.result);
                }
            });
    }
}
