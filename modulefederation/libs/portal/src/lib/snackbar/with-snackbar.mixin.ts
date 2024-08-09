/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GConstructor } from "../common/lang/constructor.type";
import { AbstractFeature } from "../feature";
import { registerMixins } from "../common/lang/mixin";

import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from "@angular/material/snack-bar";

export interface WithSnackbar {
    showSnackbar(message: string, action? : string, config?: MatSnackBarConfig) : MatSnackBarRef<TextOnlySnackBar>;
}

export function WithSnackbar<T extends GConstructor<AbstractFeature>>(base: T) :T & GConstructor<WithSnackbar> {
    return registerMixins(class WithSnackbarClass extends base implements WithSnackbar {
        // constructor

        constructor(...args: any[]) {
            super(...args);
        }

        // implement WithSnackbar

        showSnackbar(message: string, action? : string, config?: MatSnackBarConfig): MatSnackBarRef<TextOnlySnackBar> {
            return this.injector.get(MatSnackBar).open(message, action)
        }
    }, WithSnackbar)
}
