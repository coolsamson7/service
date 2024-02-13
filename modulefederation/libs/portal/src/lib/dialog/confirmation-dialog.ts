import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { ConfirmationDialogConfig } from "./confirmation-dialog-builder";
import { ButtonConfiguration } from "./dialogs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { CommonDialog } from "./dialog-builder";

@Component({
    selector: 'confirmation-dialog',
    templateUrl: './confirmation-dialog.html',
    styleUrls: ['./confirmation-dialog.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule]
})
export class ConfirmationDialog extends CommonDialog implements OnInit {
    // constructor
    
    constructor(dialogRef : MatDialogRef<ConfirmationDialog>, @Inject(MAT_DIALOG_DATA) public data : ConfirmationDialogConfig) {
        super(dialogRef)
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
