import { DialogService } from "./dialogs";
import { DynamicDialog } from "./dynamic-dialog";
import { ComponentType } from "@angular/cdk/portal";
import { AbstractDialogBuilder, AbstractDialogConfig } from "./abstract-dialog-builder";


export interface DynamicDialogConfig extends AbstractDialogConfig {
    component: ComponentType<any>,
    arguments?: any
}


export class DynamicDialogBuilder extends AbstractDialogBuilder<DynamicDialogConfig> {
    // constructor

    constructor(dialog : DialogService) {
        super(dialog, DynamicDialog, {
            title: "",
            component: DynamicDialog,
            buttons: []
        })
    }

    // fluent

    /**
     * set the dialog title
     * @param title the title
     */
    component(component : ComponentType<any>) : this {
        this.configuration.component = component;

        return this;
    }

    /**
     * set the dialog arguments
     * @param args the arguments
     */
    args(args : any) : this {
        this.configuration.arguments = args;

        return this;
    }
}

