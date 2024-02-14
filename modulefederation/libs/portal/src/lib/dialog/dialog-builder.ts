/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { OnInit, inject } from "@angular/core"
import { get } from "../common"
import { ButtonConfiguration, ButtonData } from "./dialogs"
import { MatDialogRef } from "@angular/material/dialog"
import { Translator } from "../i18n"

export class DialogBuilder {
}


export interface ButtonDecorator {
    decorate(button: ButtonData, dialog: CommonDialog) : void
  }
  
class I18NDecorator implements ButtonDecorator {
    // implement ButtonDecorator
  
    decorate(button: ButtonData, dialog: CommonDialog) : void {
        if (button.i18n) {
            const colon = button.i18n.indexOf(":")
            const namespace = button.i18n.substring(0, colon)
            const prefix = button.i18n.substring(colon + 1)
  
            let translations = dialog.translator.findTranslationsFor(namespace)
    
            if ( translations ) {
                if ( prefix.indexOf(".") > 0)
                    button.label = get(translations, prefix)
                else {
                    translations = translations[prefix]
                    
                    if ( translations ) {
                        // clear old values that only make sense in the context of i18n
                        // TODO: these are??
  
                        ["speeech"].forEach(name => (<any>button)[name] = undefined)
  
                        // set new values
  
                        Object.getOwnPropertyNames(translations).forEach(name => {
                            switch (name) {
                                case "label":
                                case "tooltip":
                                case "shortcut":
                                case "speech":
                                    if (!(<any>button)[name])
                                        (<any>button)[name] = translations[name]
                                break;
                        
                                default:
                                    
                            } // switch
                        })
                    }
                } // else
            } // if
        } // if
    }
  }
  
  class RunDecorator implements ButtonDecorator {
    // implement ButtonDecorator
  
    decorate(button: ButtonData, dialog: CommonDialog) : void {
      button.run = () => dialog.click(button)
    }
  }
  
  
  export abstract class CommonDialog {
    // static
  
    static decorators : ButtonDecorator[] = [new I18NDecorator(), new RunDecorator()]
  
    static addDecorator(decorator: ButtonDecorator) {
      CommonDialog.decorators.push(decorator)
    }
  
    // instance data
  
    translator : Translator
  
    // constructor
  
    constructor(protected dialogRef : MatDialogRef<CommonDialog>) {
      this.translator = inject(Translator)
    }
  
    // protected
  
    protected decorate(button: ButtonConfiguration) : ButtonConfiguration {
        for (const decorator of CommonDialog.decorators)
            decorator.decorate(<ButtonData>button, this)
  
        return button
    }
  
    click(button : ButtonConfiguration) : void {
      // noop
    }

  }