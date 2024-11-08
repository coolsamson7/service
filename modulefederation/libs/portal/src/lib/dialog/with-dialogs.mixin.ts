import { inject } from "@angular/core";
import { AbstractFeature } from "../feature";
import { registerMixins } from "@modulefederation/common";
import { DialogService, Dialogs } from "./dialogs";
import { ComponentType } from "@angular/cdk/portal";
import { Observable } from "rxjs";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";
import { InputDialogBuilder } from "./input-dialog-builder";
import { GConstructor } from "@modulefederation/common";
import { DynamicDialogBuilder } from "./dynamic-dialog-builder";


export function WithDialogs<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<Dialogs> &  T  {
    return registerMixins(class WithDialogsClass extends base implements Dialogs {
        // instance data

        private dialogs : DialogService

      // constructor

      constructor(...args: any[]) {
        super(...args);

        this.dialogs = inject(DialogService)
        }


        // implement OnLocalChange

        openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any> {
            return this.dialogs.openDialog(component, configuration)
        }

        confirmationDialog() : ConfirmationDialogBuilder {
            return this.dialogs.confirmationDialog()
        }

        dynamicDialog() : DynamicDialogBuilder {
            return this.dialogs.dynamicDialog()
        }

        inputDialog() : InputDialogBuilder {
            return this.dialogs.inputDialog()
        }

    }, WithDialogs)
  }
