import { Injectable } from "@angular/core"
import { ValidationMessageProvider, ViolationContext, RegisterValidationMessageProvider } from "@modulefederation/common"
import { Translator } from "../../i18n"


@RegisterValidationMessageProvider("number")
@Injectable({providedIn: 'root'})
export class NumberValidationMessageProvider implements ValidationMessageProvider {
    // constructor

    constructor(private translator: Translator) {}

    // implement ValidationMessageProvider

    provide(context: ViolationContext): string {
        let args = {}

        switch (context.violation.name) {
            case "type":
            case "required":
                args = { label: context.label, value: context.violation.value }
                break;
            case "min":
            case "max":
            case "lessThan":
            case "greaterThan":
                args = {
                    label: context.label,
                    value: context.violation.value,
                    ...context.violation.params,
                }
                break;

            default:
        }

        const message = context.label ? "label_message" : "message"
        return this.translator.translate(`validation:number.${context.violation.name}.${message}`, args)
    }
}