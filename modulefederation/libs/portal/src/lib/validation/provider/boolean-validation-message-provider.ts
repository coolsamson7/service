import { Injectable } from "@angular/core"
import { ValidationMessageProvider, ViolationContext, RegisterValidationMessageProvider } from "@modulefederation/common"
import { Translator } from "../../i18n"



@RegisterValidationMessageProvider("boolean")
@Injectable({providedIn: 'root'})
export class BooleanValidationMessageProvider implements ValidationMessageProvider {
    // constructor

    constructor(private translator: Translator) {}

    // implement ValidationMessageProvider

    provide(context: ViolationContext): string {
        let args = {}
     
        switch (context.violation.name) {
            case "type":
            case "required":
            case "isTrue":
            case "isFalse":
                args = { label: context.label, value: context.violation.value }
                break;
            default:
                
        }

        const message = context.label ? "label_message" : "message"

        return this.translator.translate(`validation:boolean.${context.violation.name}.${message}`, args)
    }
}
