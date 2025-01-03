import { ComponentType } from "@angular/cdk/portal";
import { ButtonConfiguration, DialogService } from "./dialogs";
import { Observable } from "rxjs";

export interface AbstractDialogConfig {
 title: string,
 buttons: ButtonConfiguration[]
}


export class AbstractDialogBuilder<T extends AbstractDialogConfig> {
    // constructor

    constructor(private dialogs : DialogService, protected dialog: ComponentType<any>, protected configuration: T) {
    }

    // fluent

    /**
     * set the dialog title
     * @param title the title
     */
    title(title : string) : this {
        this.configuration.title = title;

        return this;
    }

    /**
     * add a button
     * @param button the {@link ButtonConfiguration}
     */
    button(button : ButtonConfiguration) : this {
        this.configuration.buttons.push(button);

        return this;
    }

    // convenience

    /**
     * add "ok"
     */
    public ok() : this {
        return this
            .button({
                i18n: "portal.commands:ok",
                primary: true,
                result: true
            })
    }

    /**
     * add "ok" and "cancel" buttons
     */
    public okCancel() : this {
        return this
            .button({
                i18n: "portal.commands:ok",
                primary: true,
                result: true
            })
            .button({
                i18n: "portal.commands:cancel",
                result: undefined
            });
    }

    // show

    /**
     * show the dialog and return the button value
     */
    show() : Observable<any> {
        return this.dialogs.openDialog(this.dialog, {
            data: this.configuration
        });
    }
}
