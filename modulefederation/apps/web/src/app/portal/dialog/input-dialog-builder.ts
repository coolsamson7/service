import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { InputDialog } from "./input-dialog";
import { ButtonConfiguration } from "./dialogs";

export interface InputDialogConfig {
    title: string,
    message: string,
    required: boolean,
    placeholder: string,
    inputType: "text" | "number",
    defaultValue: any,
    buttons: ButtonConfiguration[]
}
export class InputDialogBuilder {
    // instance data

    configuration : InputDialogConfig = {
        title: "",
        message: "",
        placeholder: "",
        inputType: "text",
        required: true,
        defaultValue: "",
        buttons: []
    }

    // constructor

    constructor(private dialog : MatDialog) {
    }

    // fluent

    /**
     * set the dialog title
     * @param title the title
     */
    title(title : string) : InputDialogBuilder {
        this.configuration.title = title;

        return this;
    }

    /**
     * set the dialog message
     * @param message the message
     */
    message(message : string) : InputDialogBuilder {
        this.configuration.message = message;

        return this;
    }

    /**
     * set the dialog placeholder
     * @param placeholder the placeholder
     */
    placeholder(placeholder : string) : InputDialogBuilder {
        this.configuration.placeholder = placeholder;

        return this;
    }

    /**
     * add a button
     * @param button the {@link ButtonConfiguration}
     */
    button(button : ButtonConfiguration) : InputDialogBuilder {
        // @ts-ignore
        this.configuration.buttons.push(button);

        return this;
    }

    inputType(type: "text" | "number") : InputDialogBuilder {
        this.configuration.inputType = type

        return this
    }

    defaultValue(value: any) : InputDialogBuilder {
        this.configuration.defaultValue = value

        return this
    }

    // convenience

    /**
     * add "ok"
     */
    public ok() : InputDialogBuilder {
        return this
            .button({
                label: "Ok",
                result: true
            })
    }

    /**
     * add "ok" and "cancel" buttons
     */
    public okCancel() : InputDialogBuilder {
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
        const dialogRef = this.dialog.open(InputDialog, {
            data: this.configuration
        });

        return dialogRef.afterClosed()
    }
}
