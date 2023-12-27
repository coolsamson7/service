import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ButtonConfiguration } from "./dialogs";

export class ConfirmationDialogBuilder {
    // instance data

    configuration = {
        type: "info",
        title: "",
        message: "",
        buttons: []
    }

    // constructor

    constructor(private dialog : MatDialog) {
    }

    // fluent

    /**
     * set the dialog type
     * @param type the type
     */
    type(type : "info" | "warning" | "error") : ConfirmationDialogBuilder {
        this.configuration.type = type;

        return this;
    }

    /**
     * set the dialog title
     * @param title the title
     */
    title(title : string) : ConfirmationDialogBuilder {
        this.configuration.title = title;

        return this;
    }

    /**
     * set the dialog message
     * @param message the message
     */
    message(message : string) : ConfirmationDialogBuilder {
        this.configuration.message = message;

        return this;
    }

    /**
     * add a button
     * @param button the {@link ButtonConfiguration}
     */
    button(button : ButtonConfiguration) : ConfirmationDialogBuilder {
        // @ts-ignore
        this.configuration.buttons.push(button);

        return this;
    }

    // convenience

    /**
     * add "ok"
     */
    public ok() : ConfirmationDialogBuilder {
        return this
            .button({
                label: "Ok",
                result: true
            })
    }

    /**
     * add "ok" and "cancel" buttons
     */
    public okCancel() : ConfirmationDialogBuilder {
        return this
            .button({
                label: "Ok",
                result: true
            })
            .button({
                label: "Cancel",
                result: undefined
            });
    }

    // show

    /**
     * show the dialog and return the button value
     */
    show() : Observable<any> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            data: this.configuration
        });

        return dialogRef.afterClosed()
    }
}
