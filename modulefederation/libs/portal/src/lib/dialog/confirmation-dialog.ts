import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { ConfirmationDialogConfig } from "./confirmation-dialog-builder";
import { ButtonConfiguration } from "./dialogs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'confirmation-dialog',
    templateUrl: './confirmation-dialog.html',
    styleUrls: ['./confirmation-dialog.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule]
})
export class ConfirmationDialog implements OnInit {
    constructor(
        public dialogRef : MatDialogRef<ConfirmationDialog>,
        @Inject(MAT_DIALOG_DATA) public data : ConfirmationDialogConfig,
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

    click(button : ButtonConfiguration) : void {
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
