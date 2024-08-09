import { Injectable } from "@angular/core"
import { ValidationMessageProvider, ViolationContext, RegisterValidationMessageProvider } from "@modulefederation/common"
import { Translator } from "../../i18n"



@RegisterValidationMessageProvider("string")
@Injectable({providedIn: 'root'})
export class StringValidationMessageProvider implements ValidationMessageProvider {
    // constructor

    constructor(private translator: Translator) {}

    // implement ValidationMessageProvider

    provide(context: ViolationContext): string {
        // compute args

        let args = {}
        switch (context.violation.name) {
            case "type":
            case "required":
            case "nonEmpty":
            case "email":
                args = { label: context.label, value: context.violation.value }
                break;

            case "length":
            case "min":
            case "max":
                args = {
                    label: context.label,
                    value: context.violation.value,
                    ...context.violation.params,
                }
                break;

            case "matches":
                args = {
                    label: context.label,
                    value: context.violation.value,
                    re: context.violation.params.re,
                }
                break
                default:
                    args = {}
        }

        const message = context.label ? "label_message" : "message"
        return this.translator.translate(`validation:string.${context.violation.name}.${message}`,args)
    }
}
