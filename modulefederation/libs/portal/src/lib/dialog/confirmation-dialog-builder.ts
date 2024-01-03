import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ButtonConfiguration } from "./dialogs";
import { Translator } from "../i18n";
import { ShortcutManager } from "../shortcuts";

export interface ConfirmationDialogConfig {
    title : string;
    type : string;
    message : string;
    buttons : ButtonConfiguration[]
}

export class ConfirmationDialogBuilder {
    // instance data

    configuration : ConfirmationDialogConfig = {
        type: "info",
        title: "",
        message: "",
        buttons: []
    }

    // constructor

    constructor(private dialog : MatDialog, private translator: Translator, private shortcutManager: ShortcutManager) {
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
                label: this.translator.translate("portal.commands:ok.label"),
                primary: true,
                result: true
            })
    }

    /**
     * add "ok" and "cancel" buttons
     */
    public okCancel() : ConfirmationDialogBuilder {
        return this
            .button({
                label: this.translator.translate("portal.commands:ok.label"),
                primary: true,
                result: true
            })
            .button({
                label: this.translator.translate("portal.commands:cancel.label"),
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
